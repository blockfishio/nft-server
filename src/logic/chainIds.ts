import { ChainId } from '@dcl/schemas'

export const getCollectionsChainId = () =>
  parseInt(
    process.env.COLLECTIONS_CHAIN_ID || ChainId.ETHEREUM_MAINNET.toString()
  ) as ChainId

export const getMarketplaceChainId = () =>
  parseInt(
    process.env.MARKETPLACE_CHAIN_ID || ChainId.ETHEREUM_MAINNET.toString()
  ) as ChainId

export const getETHMarketChainId = () =>
parseInt(
  process.env.ETHMARKETPLACE_CHAIN_ID || ChainId.ETHEREUM_MAINNET.toString()
) as ChainId

export const getBSCMarketChainId = () =>
parseInt(
  process.env.BSCMARKETPLACE_CHAIN_ID || ChainId.BSC_MAINNET.toString()
) as ChainId