const abi_nft_market = require("./abi/nft_market.json");
const abi_web_gate_way = require('./abi/wmb_gate_way.json');
const abi_multi_sig_verifier = require('./abi/multi_sig_verifier.json');
let config = {
    nodeUrl:'https://rpc-amoy.polygon.technology',
    abi:{
        nftMarket:abi_nft_market,
        webGateWay: abi_web_gate_way,
        multiSigVerifier:abi_multi_sig_verifier
    },
    scAddr:{
        nftMarket:"0xB9B4914029f0CbbD93D11d949D830C86c011192C",
        webGateWay:"0x5D7Bb1f127ADFD795627fe9b52c635088EcB8CF5",
        multiSigVerifier:"0xBb53B619f531F356035479fF15cFa1F3FcD47812",
    },
    stellarScAddr:{
        nft_market:"CC4ZSJB43G7OMOL476N35POCYM5MSG2FUNKMLUBYBJJ46QD2YEQYPLLO",        
    }
}

module.exports = config;