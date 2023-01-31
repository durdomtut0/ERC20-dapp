import {Contract} from "ethers";
import {
    EXCHANGE_CONTRACT_ABI,
    EXCHANGE_CONTRACT_ADDRESS,
    TOKEN_CONTRACT_ABI,
    TOKEN1_CONTRACT_ADDRESS

}from "../constants"

export const getAmountOfTokensReceivedFromSwap = async(
    _swapAmountWei,
    provider,
    ethSelected,
    ethBalance,
    reservedTokens
) =>{
    const exchangeContract = new Contract(
        EXCHANGE_CONTRACT_ADDRESS,
        EXCHANGE_CONTRACT_ABI,
        provider
        )
    let amountOfTokens
    if (ethSelected){
        amountOfTokens = await exchangeContract.getAmountOfTokens(
            _swapAmountWei,
            ethBalance,
            reservedTokens
        );
    } else {
        amountOfTokens = await exchangeContract.getAmountOfTokens(
            _swapAmountWei,
            reservedTokens,
            ethBalance
        );
    }
    return amountOfTokens;
}

export const swapTokens = async(
    signer,
    swapAmountWei,
    tokenToBeReceivedAfterSwap,
    ethSelected
) =>{
    const exchangeContract = new Contract(
        EXCHANGE_CONTRACT_ADDRESS,
        EXCHANGE_CONTRACT_ABI,
        signer
    )
    const tokenContract = new Contract(
        TOKEN1_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
    )
    let tx;

    if (ethSelected){
        tx = await exchangeContract.ethToToken(
            tokenToBeReceivedAfterSwap,
            {value: swapAmountWei}
        )
    } else{
        //TODO approve for max amount and with if else check approval
        tx = await tokenContract.approve(
            EXCHANGE_CONTRACT_ADDRESS,
            swapAmountWei.toString()
        )
        await tx.wait();
        tx = await exchangeContract.tokenToEth(
            swapAmountWei,
            tokenToBeReceivedAfterSwap
        );
    }
    await tx.wait();
}
