///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

const BOT_TOKEN = '8225959413:AAGmDSHUYYZN2FKd5t_VMH_IsAOHecNcqe0'; 
const API_URL = 'https://iam404.serv00.net/vpn-database/sn-vpn/api.php'; 

// ခွင့်ပြုထားသော Admin IDs
const ADMIN_IDS = [7640437122, 1273841502];

export async function handleUpdate(update, env) {
    if (!update.message) return;

    const message = update.message;
    const chatId = message.chat.id;
    const userId = message.from.id;

    // Admin ဟုတ်မဟုတ် စစ်ဆေးခြင်း
    if (!ADMIN_IDS.includes(userId)) {
        return; 
    }

    // /update command စစ်ဆေးခြင်း
    if (message.text && message.text.startsWith('/update') && message.reply_to_message && message.reply_to_message.document) {
        const doc = message.reply_to_message.document;

        if (doc.file_name.endsWith('.json')) {
            await sendMessage(chatId, "⏳ <b>Config file ကို ဖတ်ပြီး Server သို့ Update လုပ်နေပါတယ်...</b>");
            
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
                    // HTML tag များဖြင့် ပိုမိုလှပအောင် ပြင်ဆင်ထားသည်
                    const successMsg = `✅ <b>Update Successful!</b>\n\n` +
                                     `<b>Message:</b> <code>${resultJson.message}</code>\n` +
                                     `<b>Developer:</b> ${resultJson.developer}\n` +
                                     `<b>Timestamp:</b> <i>${resultJson.timestamp}</i>`;
                    await sendMessage(chatId, successMsg);
                } else {
                    await sendMessage(chatId, `⚠️ <b>API Error:</b> <code>${resultJson.message}</code>`);
                }

            } catch (error) {
                await sendMessage(chatId, `❌ <b>System Error:</b> <code>${error.message}</code>`);
            }
        } else {
            await sendMessage(chatId, "⚠️ <b>Error:</b> ကျေးဇူးပြု၍ JSON format ရှိသော config file ကိုသာ Reply ပြန်ပေးပါ။");
        }
    }
    
    if (message.text === '/start') {
        await sendMessage(chatId, "<b>Welcome Admin!</b>\n\nconfig.json ဖိုင်ကို Reply ထောက်ပြီး <code>/update</code> ဟု ရိုက်ပို့ကာ Server ကို update လုပ်နိုင်ပါသည်။");
    }
}

/**
 * Telegram သို့ HTML Format ဖြင့် စာသားပေးပို့ရန် Function
 */
async function sendMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            chat_id: chatId, 
            text: text,
            parse_mode: 'HTML' // Markdown မှ HTML သို့ ပြောင်းလဲထားပါသည်
        })
    });
}

async function getFileLink(fileId) {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const data = await res.json();
    if (data.ok) {
        return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
    }
    throw new Error("Telegram Server မှ File ကို ဆွဲယူ၍ မရနိုင်ပါ။");
}
