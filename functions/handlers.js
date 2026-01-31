///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

const BOT_TOKEN = '8225959413:AAGmDSHUYYZN2FKd5t_VMH_IsAOHecNcqe0'; 
const API_URL = 'https://iam404.serv00.net/vpn-database/sn-vpn/api.php'; 

const ADMIN_IDS = [7640437122, 1273841502];

export async function handleUpdate(update, env) {
    if (!update.message) return;

    const message = update.message;
    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text || "";

    if (!ADMIN_IDS.includes(userId)) return;

    // --- VIP User Add Command ---
    if (text.startsWith('/vip')) {
        const parts = text.split('/vip')[1].split('|').map(p => p.trim());
        if (parts.length < 5) {
            await sendMessage(chatId, "⚠️ <b>အသုံးပြုပုံ မှားယွင်းနေပါသည်။</b>\n\n<code>/vip Name | User | Pass | HWID | ExpDate</code>");
            return;
        }
        const [name, user, pass, hwid, exp] = parts;
        await sendRequest(chatId, { action: 'add', name, user, pass, hwid, exp }, "VIP User အသစ် ထည့်သွင်းနေပါသည်...");
    }

    // --- VIP User Delete Command ---
    else if (text.startsWith('/delete')) {
        const hwid = text.split('/delete')[1]?.trim();
        if (!hwid) {
            await sendMessage(chatId, "⚠️ <b>HWID ထည့်ရန် လိုအပ်ပါသည်။</b>\n\n<code>/delete HWID_HERE</code>");
            return;
        }
        await sendRequest(chatId, { action: 'delete', hwid: hwid }, `HWID: <code>${hwid}</code> ကို ဖျက်သိမ်းနေပါသည်...`);
    }

    // --- Config Update Command (Reply format) ---
    else if (text.startsWith('/update') && message.reply_to_message && message.reply_to_message.document) {
        const doc = message.reply_to_message.document;
        if (doc.file_name.endsWith('.json')) {
            await sendMessage(chatId, "⏳ <b>Config file ကို Update လုပ်နေပါတယ်...</b>");
            try {
                const fileLink = await getFileLink(doc.file_id);
                const fileRes = await fetch(fileLink);
                const configContent = await fileRes.text();

                const formData = new URLSearchParams();
                formData.append('config_data', configContent);

                const apiRes = await fetch(`${API_URL}?action=update_config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString()
                });

                const resultJson = await apiRes.json();
                if (resultJson.result === "success") {
                    await sendMessage(chatId, `✅ <b>Config Updated!</b>\n\n<b>Dev:</b> ${resultJson.developer}`);
                } else {
                    await sendMessage(chatId, `⚠️ <b>API Error:</b> ${resultJson.message}`);
                }
            } catch (error) {
                await sendMessage(chatId, `❌ <b>System Error:</b> ${error.message}`);
            }
        }
    }
    
    else if (text === '/start') {
        const help = "<b>SN VPN Manager Bot Menu</b>\n\n" +
                     "1️⃣ <b>Add VIP:</b>\n<code>/vip Name | User | Pass | HWID | Exp</code>\n\n" +
                     "2️⃣ <b>Delete VIP:</b>\n<code>/delete HWID</code>\n\n" +
                     "3️⃣ <b>Update Config:</b>\nReply to json file with <code>/update</code>";
        await sendMessage(chatId, help);
    }
}

/**
 * API သို့ Request ပို့ရန် Common Function
 */
async function sendRequest(chatId, params, waitMsg) {
    await sendMessage(chatId, `⏳ <b>${waitMsg}</b>`);
    try {
        const queryParams = new URLSearchParams(params);
        const apiRes = await fetch(`${API_URL}?${queryParams.toString()}`);
        const resultJson = await apiRes.json();

        if (resultJson.result === "success") {
            await sendMessage(chatId, `✅ <b>Success:</b> ${resultJson.message}\n\n<b>Time:</b> ${resultJson.timestamp}`);
        } else {
            await sendMessage(chatId, `⚠️ <b>Failed:</b> ${resultJson.message}`);
        }
    } catch (error) {
        await sendMessage(chatId, `❌ <b>System Error:</b> ${error.message}`);
    }
}

async function sendMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
    });
}

async function getFileLink(fileId) {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const data = await res.json();
    if (data.ok) return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
    throw new Error("File path error");
}
