///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

const BOT_TOKEN = '8225959413:AAGmDSHUYYZN2FKd5t_VMH_IsAOHecNcqe0'; 
const API_URL = 'https://iam404.serv00.net/vpn-database/sn-vpn/api.php'; 

export async function handleUpdate(update, env) {
    if (!update.message) return;

    const message = update.message;
    const chatId = message.chat.id;

    // /update command ကို reply ပြန်ထားခြင်း ရှိမရှိ စစ်ဆေး
    if (message.text && message.text.startsWith('/update') && message.reply_to_message && message.reply_to_message.document) {
        const doc = message.reply_to_message.document;

        // config.json ဖြစ်မဖြစ် စစ်ဆေး
        if (doc.file_name.endsWith('.json')) {
            await sendMessage(chatId, "⏳ Config file ကို ဖတ်ပြီး API သို့ ပေးပို့နေပါတယ်...");
            
            try {
                // 1. Telegram ဆီက File Link ယူမယ်
                const fileLink = await getFileLink(doc.file_id);
                const fileRes = await fetch(fileLink);
                const configContent = await fileRes.text();

                // 2. သင့်ရဲ့ PHP API ဆီကို POST နဲ့ လှမ်းပို့မယ်
                // PHP code ထဲက $_POST['config_data'] နဲ့ ကိုက်ညီအောင် FormData သုံးပါမယ်
                const formData = new URLSearchParams();
                formData.append('config_data', configContent);

                const apiRes = await fetch(`${API_URL}?action=update_config`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString()
                });

                const resultJson = await apiRes.json();

                // 3. ရလဒ်ကို Bot ကနေ ပြန်ပြောမယ်
                if (resultJson.result === "success") {
                    await sendMessage(chatId, `✅ ${resultJson.message}\n\n👤 Dev: ${resultJson.developer}\n🕒 Time: ${resultJson.timestamp}`);
                } else {
                    await sendMessage(chatId, `⚠️ Failed: ${resultJson.message}`);
                }

            } catch (error) {
                await sendMessage(chatId, `❌ Error: ${error.message}`);
            }
        } else {
            await sendMessage(chatId, "⚠️ JSON file ကိုပဲ update လုပ်လို့ရမှာပါ။");
        }
    }
}

async function sendMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text })
    });
}

async function getFileLink(fileId) {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const data = await res.json();
    if (data.ok) {
        return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
    }
    throw new Error("Telegram မှ ဖိုင်ကို ရယူ၍မရပါ။");
}
