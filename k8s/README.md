# Kubernetes setup: Portfolio + Prometheus + Grafana

Is folder (`k8s/`) ko project root mein rakho (`db/`, `backend/`, `frontend/` ke saath).

```
k8s/
├── 00-namespaces.yaml        portfolio + monitoring namespaces
├── secrets.example.yaml      template, copy karke secrets.yaml banao (gitignored)
├── deploy.ps1 / deploy.sh    sab kuch apply karne ki script
├── app/
│   ├── postgres.yaml         PVC + Deployment + Service
│   ├── backend.yaml          Deployment + Service (Flask/gunicorn :5000)
│   ├── frontend.yaml         Deployment + Service (nginx :80)
│   └── ingress.yaml          Traefik ingress (k3s)
└── monitoring/
    ├── rbac.yaml             Prometheus + kube-state-metrics permissions
    ├── prometheus.yaml       config + Deployment + Service
    ├── grafana.yaml          datasource + Deployment + Service
    ├── node-exporter.yaml    DaemonSet (node CPU/RAM/disk)
    └── kube-state-metrics.yaml
```

## 1. Images (local kind cluster)

```powershell
docker build -t ghcr.io/rahulpoddarcse2/portfolio-backend:latest ./backend
docker build -t ghcr.io/rahulpoddarcse2/portfolio-frontend:latest ./frontend
kind load docker-image ghcr.io/rahulpoddarcse2/portfolio-backend:latest ghcr.io/rahulpoddarcse2/portfolio-frontend:latest --name devops-practice
kubectl config use-context kind-devops-practice
```

## 2. Secrets

```powershell
copy k8s\secrets.example.yaml k8s\secrets.yaml
notepad k8s\secrets.yaml      # CHANGE_ME values badlo
```

## 3. Deploy

```powershell
.\k8s\deploy.ps1
kubectl get pods -n portfolio -w
kubectl get pods -n monitoring -w
```

## 4. Dekho

```powershell
kubectl port-forward -n portfolio svc/frontend 8080:80       # http://localhost:8080
kubectl port-forward -n monitoring svc/grafana 3000:3000     # http://localhost:3000
kubectl port-forward -n monitoring svc/prometheus 9090:9090  # http://localhost:9090
```

Grafana: user `admin`, password wahi jo `secrets.yaml` mein daala. Dashboards -> New -> Import -> ID `1860` (Node Exporter Full).
Prometheus mein Status -> Targets: sab `UP` hone chahiye.

## Troubleshooting

```powershell
kubectl describe pod -n portfolio <pod>
kubectl logs -n portfolio deploy/backend
kubectl logs -n monitoring deploy/prometheus
```

- `ImagePullBackOff`: image kind mein load nahi hui, ya EC2/k3s pe GHCR image abhi push nahi hui.
- `CreateContainerConfigError`: secret ya `db-init` ConfigMap missing hai.
- Password badla par DB login fail: Postgres password PVC banate waqt set hota hai. `kubectl delete pvc db-data -n portfolio` karke dobara deploy karo (data delete hoga).
