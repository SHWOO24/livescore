# Git 저장소 초기화 및 GitHub 푸시 스크립트

# Git 경로 찾기
$gitPaths = @(
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\git.exe"
)

$gitExe = $null
foreach ($path in $gitPaths) {
    if (Test-Path $path) {
        $gitExe = $path
        break
    }
}

if (-not $gitExe) {
    Write-Host "❌ Git을 찾을 수 없습니다. Git Bash를 직접 사용하세요." -ForegroundColor Red
    Write-Host ""
    Write-Host "Git Bash에서 다음 명령어를 실행하세요:" -ForegroundColor Yellow
    Write-Host "  git init" -ForegroundColor Cyan
    Write-Host "  git remote add origin https://github.com/SHWOO24/livescore.git" -ForegroundColor Cyan
    Write-Host "  git add ." -ForegroundColor Cyan
    Write-Host "  git commit -m 'Initial commit: LiveScore project'" -ForegroundColor Cyan
    Write-Host "  git branch -M main" -ForegroundColor Cyan
    Write-Host "  git push -u origin main" -ForegroundColor Cyan
    exit 1
}

Write-Host "✅ Git 발견: $gitExe" -ForegroundColor Green
Write-Host ""

# 현재 디렉토리 확인
$currentDir = Get-Location
Write-Host "현재 디렉토리: $currentDir" -ForegroundColor Yellow
Write-Host ""

# Git 저장소 초기화
Write-Host "1. Git 저장소 초기화 중..." -ForegroundColor Cyan
& $gitExe init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git 초기화 실패" -ForegroundColor Red
    exit 1
}

# 원격 저장소 추가 (이미 있으면 스킵)
Write-Host "2. 원격 저장소 확인 중..." -ForegroundColor Cyan
$remoteCheck = & $gitExe remote -v 2>&1
if ($remoteCheck -match "origin") {
    Write-Host "⚠️  원격 저장소가 이미 설정되어 있습니다." -ForegroundColor Yellow
    Write-Host "   기존 원격 저장소를 제거하려면: git remote remove origin" -ForegroundColor Yellow
} else {
    Write-Host "3. 원격 저장소 추가 중..." -ForegroundColor Cyan
    & $gitExe remote add origin https://github.com/SHWOO24/livescore.git
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 원격 저장소 추가 실패" -ForegroundColor Red
        exit 1
    }
}

# 모든 파일 추가
Write-Host "4. 파일 추가 중..." -ForegroundColor Cyan
& $gitExe add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 파일 추가 실패" -ForegroundColor Red
    exit 1
}

# 커밋
Write-Host "5. 커밋 중..." -ForegroundColor Cyan
& $gitExe commit -m "Initial commit: LiveScore project with ESPN fallback and polling system"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  커밋 실패 (이미 커밋된 파일이 있을 수 있습니다)" -ForegroundColor Yellow
}

# main 브랜치로 설정
Write-Host "6. main 브랜치로 설정 중..." -ForegroundColor Cyan
& $gitExe branch -M main
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  브랜치 이름 변경 실패 (이미 main일 수 있습니다)" -ForegroundColor Yellow
}

# 푸시
Write-Host "7. GitHub에 푸시 중..." -ForegroundColor Cyan
Write-Host "   (GitHub 인증이 필요할 수 있습니다)" -ForegroundColor Yellow
& $gitExe push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 푸시 실패" -ForegroundColor Red
    Write-Host ""
    Write-Host "다음 사항을 확인하세요:" -ForegroundColor Yellow
    Write-Host "  1. GitHub 인증 (Personal Access Token 필요)" -ForegroundColor Yellow
    Write-Host "  2. 저장소가 이미 존재하는지 확인" -ForegroundColor Yellow
    Write-Host "  3. 네트워크 연결 확인" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ 성공! GitHub에 푸시되었습니다." -ForegroundColor Green
Write-Host "   https://github.com/SHWOO24/livescore" -ForegroundColor Cyan
