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

Next, install cert manager:

https://docs.cert-manager.io/en/latest/tutorials/acme/quick-start/index.html
