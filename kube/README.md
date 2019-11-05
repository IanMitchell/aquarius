# Digital Ocean Kubernetes Setup

First, create a secret for your Docker Hub credentials:

```bash
kubectl create secret docker-registry dockerhub --docker-server=https://index.docker.io/v1/ --docker-username=<USERNAME> --docker-password=<PASSWORD> --docker-email=<EMAIL>
```

Next, modify the default firewall to allow connections to the API server:

```bash
doctl compute firewall create \
  --inbound-rules="protocol:tcp,ports:80,address:0.0.0.0/0,address:::/0 protocol:tcp,ports:443,address:0.0.0.0/0,address:::/0" \
  --tag-names=k8s:<CLUSTER_UUID> \
  --name=aquarius-api
```

Install nginx:

```bash
helm install stable/nginx-ingress --name=aquarius-nginx -f kube/nginx.yml
```

Install external-dns:

```bash
helm install --name=aquarius-dns -f kube/dns.yml stable/external-dns
```

Next, install cert manager:

Ref: https://docs.cert-manager.io/en/latest/tutorials/acme/quick-start/index.html


```bash
kubectl create namespace cert-manager
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v0.11.0/cert-manager.yaml
```

Verify with:

```
kubectl get pods --namespace cert-manager
```

Then install Certs:

```bash
kubectl apply -f kube/certificate.yml
kubectl apply -f kube/ingress.yml
```
