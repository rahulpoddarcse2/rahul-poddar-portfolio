#!/usr/bin/env bash
# Linux / EC2: ./k8s/deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f secrets.yaml ]; then
  echo "secrets.yaml nahi mili. Pehle: cp secrets.example.yaml secrets.yaml aur CHANGE_ME values bharo."
  exit 1
fi
if grep -q CHANGE_ME secrets.yaml; then
  echo "secrets.yaml mein abhi CHANGE_ME bacha hai. Real values daalo."
  exit 1
fi

kubectl apply -f 00-namespaces.yaml
kubectl apply -f secrets.yaml
kubectl create configmap db-init -n portfolio --from-file=init.sql=../db/init.sql --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f app/
kubectl apply -f monitoring/

echo
kubectl get pods -n portfolio
kubectl get pods -n monitoring
