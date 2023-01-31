import {Contract, utils} from "ethers";
import {
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    TOKEN1_CONTRACT_ADDRESS

}from "../constants"

export const addLiquidity = async (
    signer,
    addTokenAmountWei,
    addEtherAmountWei
) =>{
    try {
        const tokenContract = new Contract(
            TOKEN1_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            signer
        );
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            signer
        )
        //TODO approve for max amount and with if else check approval
        let tx = await tokenContract.approve(
            EXCHANGE_CONTRACT_ADDRESS,
            addTokenAmountWei.toString()
        )
        await tx.wait();
        tx = await exchangeContract.addLiquidity(
            addTokenAmountWei, {value: addEtherAmountWei}
        )
        await tx.wait();


    } catch (error) {
        console.log(error)
    }
}

export const calculateTokens = async(
    _addEther = "0",
    etherBalanceContract,
    tokenReserve
) =>{
    const _addEtherAmountWei = utils.parseEther(_addEther);
    const tokenAmount = _addEtherAmountWei
        .mul(tokenReserve)
        .div(etherBalanceContract);

    return tokenAmount    
}