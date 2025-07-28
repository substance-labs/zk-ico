import { AzguardClient } from "@azguardwallet/client"

// check if the Azguard Wallet extension is installed
if (!(await AzguardClient.isAzguardInstalled())) {
  // if not, then suggest the user to install it from Chrome Web Store
  // https://chromewebstore.google.com/detail/azguard-wallet/pliilpflcmabdiapdeihifihkbdfnbmn
  throw new Error(
    "Azguard not installed. Download it from: https://chromewebstore.google.com/detail/azguard-wallet/pliilpflcmabdiapdeihifihkbdfnbmn",
  )
}

const azguard = await AzguardClient.create()

await azguard
  .connect(
    {
      name: "ZkIco",
    },
    [
      {
        chains: [`aztec:11155111`],
        methods: [
          "simulate_transaction",
          "call",
          "send_transaction",
          "register_contract",
          "register_sender",
          "register_token",
          "simulate_views",
          "add_private_authwit",
        ],
      },
    ],
  )
  .catch(console.error)

azguard.onDisconnected.addHandler(() => {
  console.log("Azguard disconnected")
})

export default azguard
