<?php
header('content-type: application/json');
require_once 'Bot.php';
$bot = new Bot();
// 获取/token 命令，获取聊天 id
$data = json_decode(file_get_contents("php://input"), true);
$message = $data['message']['text'] ?? '';
if ($message === '/start') {
    $chat_id = $data['message']['chat']['id'];
   
    $bot->sendMessage(['text' => "关于： tg酱（@realtgchat_bot）是一个简单易用的TG消息发送机器人，只要是有网络的地方，你就可以通过浏览器输入一串网址即可让TG酱向您的TG发送通知------------ 第一次使用请发送 /token 获取个人专属token ------------使用方法：https://tgbot-red.vercel.app/api?token=TG获取的token&message=你要发送的消息", 'chat_id' => $chat_id]);
}
if ($message === '/token') {
    $chat_id = $data['message']['chat']['id'];
    $bot->sendMessage(['text' => $bot->encryption($chat_id), 'chat_id' => $chat_id]);
}
if ($message === '/usage') {
    $chat_id = $data['message']['chat']['id'];
    $bot->sendMessage(['text' => "使用方法：https://tgbot-red.vercel.app/api?token=TG获取的token&message=你要发送的消息", 'chat_id' => $chat_id]);
}
echo json_encode(['code' => 200, 'message' => 'success']);
