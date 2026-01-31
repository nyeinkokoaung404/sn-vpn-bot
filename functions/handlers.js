///////////////////////////////////////////////
// Copyright (C) t.me/nkka404
// Channel: https://t.me/premium_channel_404
///////////////////////////////////////////////

const BOT_TOKEN = '8225959413:AAGmDSHUYYZN2FKd5t_VMH_IsAOHecNcqe0'; // Bot Token ထည့်ရန်
const API_BASE_URL = 'https://iam404.serv00.net/vpn-database/sn-vpn/api.php'; // မိမိ API URL

export async function handleUpdate(update, env) {
    if (!update.message) return;

    const message = update.message;
    const chatId = message.chat.id;

    // /update command ကို reply ပြန်ထားခြင်း ရှိမရှိ စစ်ဆေး
    if (message.text && message.text.startsWith('/update') && message.reply_to_message && message.reply_to_message.document) {
        const doc = message.reply_to_message.document;

        // config.json ဖြစ်မဖြစ် စစ်ဆေး (Optional)
        if (doc.file_name.endsWith('.json')) {
            await sendMessage(chatId, "⏳ File ကို ဖတ်နေပါတယ်၊ ခဏစောင့်ပေးပါ...");
            
            try {
                // Telegram Server ကနေ File link ကို ယူခြင်း
                const fileLink = await getFileLink(doc.file_id);
                const response = await fetch(fileLink);
                const configText = await response.text();

                // API သို့ အချက်အလက် ပေးပို့ခြင်း
                // Note: URL encoding လုပ်ဖို့ လိုအပ်ပါတယ်
                const updateUrl = `${API_BASE_URL}?action=update_config=${encodeURIComponent(configText)}`;
                
                const apiRes = await fetch(updateUrl);
                const result = await apiRes.text();

                await sendMessage(chatId, `✅ Update အောင်မြင်ပါသည်။\n\nServer Response: ${result}`);
            } catch (error) {
                await sendMessage(chatId, `❌ Error: ${error.message}`);
            }
        } else {
            await sendMessage(chatId, "⚠️ ကျေးဇူးပြု၍ JSON format ရှိသော config file ကို reply ပြန်ပေးပါ။");
        }
    } else if (message.text === '/start') {
        await sendMessage(chatId, "Welcome! config.json file ကို reply ထောက်ပြီး /update လို့ ရိုက်ပို့ပေးပါ။");
    }
}

// Telegram Bot API functions
async function sendMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: text })
    });
}

async function getFileLink(fileId) {
    const getFileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
    const res = await fetch(getFileUrl);
    const data = await res.json();
    
    if (data.ok) {
        return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
    } else {
        throw new Error("File link ရယူ၍ မရနိုင်ပါ။");
    }
}
