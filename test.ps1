# TGMessage Bot API 测试脚本 (PowerShell)
# 使用方法: .\test.ps1 YOUR_TOKEN

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$WorkerUrl = "https://tgmessage.f1car.workers.dev"

Write-Host "🚀 TGMessage Bot API 测试脚本" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Worker URL: $WorkerUrl"
Write-Host "Token: $($Token.Substring(0, [Math]::Min(10, $Token.Length)))..."
Write-Host ""

function Test-Api {
    param(
        [string]$Name,
        [string]$Url,
        [hashtable]$Body = $null
    )

    Write-Host "📧 $Name" -ForegroundColor Yellow
    try {
        if ($Body) {
            $JsonBody = $Body | ConvertTo-Json -Depth 10
            $Response = Invoke-RestMethod -Uri $Url -Method POST -ContentType "application/json" -Body $JsonBody
        } else {
            $Response = Invoke-RestMethod -Uri $Url -Method GET
        }
        Write-Host "✅ 响应: $($Response | ConvertTo-Json -Compress)" -ForegroundColor Green
    } catch {
        Write-Host "❌ 错误: $_" -ForegroundColor Red
    }
    Write-Host ""
}

# 测试 1: 文本消息
$EncodedToken = [System.Web.HttpUtility]::UrlEncode($Token)
Test-Api -Name "测试 1: 发送文本消息" -Url "$WorkerUrl/api?token=$EncodedToken&message=你好，世界！这是一条测试消息。"

# 测试 2: Markdown 格式
Test-Api -Name "测试 2: 发送 Markdown 格式消息" -Url "$WorkerUrl/api?token=$EncodedToken&type=markdown&message=*粗体文本* _斜体文本_ `代码文本`"

# 测试 3: HTML 格式
Test-Api -Name "测试 3: 发送 HTML 格式消息" -Url "$WorkerUrl/api?token=$EncodedToken&type=html&message=<b>粗体</b><i>斜体</i><code>代码</code>"

# 测试 4: 发送图片
Test-Api -Name "测试 4: 发送图片" -Url "$WorkerUrl/api" -Body @{
    token = $Token
    type = "photo"
    photo = "https://picsum.photos/400/300"
    caption = "这是一张随机图片"
}

# 测试 5: 发送位置
Test-Api -Name "测试 5: 发送地理位置" -Url "$WorkerUrl/api" -Body @{
    token = $Token
    type = "location"
    latitude = 39.9042
    longitude = 116.4074
}

# 测试 6: 创建投票
Test-Api -Name "测试 6: 创建投票" -Url "$WorkerUrl/api" -Body @{
    token = $Token
    type = "poll"
    question = "你最喜欢什么编程语言？"
    options = "JavaScript,TypeScript,Python,Go,Rust"
    is_anonymous = $true
}

Write-Host "✅ 所有测试完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📖 更多用法请参考: $WorkerUrl" -ForegroundColor Cyan
