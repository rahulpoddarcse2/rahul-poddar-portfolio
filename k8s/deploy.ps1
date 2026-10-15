# Windows PowerShell: .\k8s\deploy.ps1  (project root se chalao)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path "secrets.yaml")) {
  Write-Host "secrets.yaml nahi mili. Pehle: copy secrets.example.yaml secrets.yaml  aur CHANGE_ME values bharo."
  exit 1
}
if (Select-String -Path "secrets.yaml" -Pattern "CHANGE_ME" -Quiet) {
  Write-Host "secrets.yaml mein abhi CHANGE_ME bacha hai. Real values daalo."
  exit 1
}

kubectl apply -f 00-namespaces.yaml
kubectl apply -f secrets.yaml
kubectl create configmap db-init -n portfolio --from-file=init.sql=../db/init.sql --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f app/
kubectl apply -f monitoring/

Write-Host "`nPods:"
kubectl get pods -n portfolio
kubectl get pods -n monitoring
