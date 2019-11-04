# Expose API

https://stackoverflow.com/questions/54119399/expose-port-80-on-digital-oceans-managed-kubernetes-without-a-load-balancer

You'll need to add a firewall:

```bash
doctl compute firewall create \
  --inbound-rules="protocol:tcp,ports:80,address:0.0.0.0/0,address:::/0 protocol:tcp,ports:443,address:0.0.0.0/0,address:::/0" \
  --tag-names=k8s:CLUSTER_UUID \
  --name=k8s-extra-mycluster
```


Install cert:

https://docs.cert-manager.io/en/latest/tutorials/acme/quick-start/index.html
