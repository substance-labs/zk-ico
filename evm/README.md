# evm

## 🚀 Getting Started

### Build

```shell
$ forge build
```

### Deploy

```shell
forge create --broadcast \
  --private-key <private_key> \
  --rpc-url <rpc_url> \
  src/ZkIco.sol:ZkIco \
  --constructor-args <gateway> <aztec_buy_token> <buy_token> <ico_token> <verifier> <rate> <title> <description>
```


```shell
forge create  --broadcast \
  --private-key <private_key> \
  --rpc-url <rpc_url> \
  src/ZkIcoToken.sol:ZkIcoToken \
  --constructor-args <name> <aztec_inbox> <symbol> <to> <total_supply>
 
```