@echo off
setlocal EnableDelayedExpansion

set IP_LIST=

for /f "usebackq tokens=*" %%A in ("ips.txt") do (
    set "line=%%A"
    set IP_LIST=!IP_LIST! !line!
)

echo Generating cert for: %IP_LIST%
mkcert -cert-file cert.pem -key-file key.pem %IP_LIST%

echo Done. Output:
echo - cert.pem
echo - key.pem
pause
