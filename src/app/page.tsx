'use client';
import { Base} from '@thirdweb-dev/chains';
import {
  ThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
} from "@thirdweb-dev/react";
import OnchainProviders from '@/components/OnchainProviders';
import ViewPixel from '@/components/ViewPixel';
import { Upp } from '@/components/Upp';
import WalletComponents from '@/components/WalletComponents';
import logow from './logow.png';
import base from './base.png';
import sweep from './sweep.png';
import './css.css';

export default function Page() {
  return (
    <div>
    <div style={{position:'absolute', top:'50px', right:'40vw'}}>
         <div style={{display:"flex", flexDirection:"column", alignItems:'center'}}>
         <img src={sweep.src} alt="Description of the image" width={"180vw"} style={{marginBottom:'-0.9vh'}} />
        <h2 style={{fontFamily:'onchain', fontSize:'4vh', marginBottom:'1.2vh', color:'#9DE59C'}}>onchainsweeper</h2>
        <div style={{display:"flex", flexDirection:"column", alignItems:'center'}}>
       on  <img src={base.src} alt="Description of the image" width={"110vw"}/>
       </div>
       </div>
       </div>
    <div>
      <ThirdwebProvider activeChain={Base} clientId="51f0ab83ae35cead629f58d9fbded3ec" supportedWallets={[
        coinbaseWallet(),
      ]}>
  
    <OnchainProviders>
      <div style={{marginTop:'20vh'}}>
      <div style={{position:'absolute', right:'50px', top:'50px'}}>
        <WalletComponents />
      </div>
      <div style={{position:'absolute', right:'650px'}}>
      <div style={{position:'relative', width:'fit-content', height:'fit-content', backgroundColor:'#000'}}>
      <div style={{position:'absolute',bottom:'0',right:'0', zIndex:'3'}}>
        <Upp/>
      </div>
      <div style={{position:'absolute',bottom:'0',right:'0', zIndex:'0'}}>
          <ViewPixel />
        </div>
        </div>
        </div>
        </div>
    </OnchainProviders>
  
    
    
    </ThirdwebProvider>
  </div>
        
  </div>
  );
}

