import { Network, NFTCategory,
  //  Rarity, 
  //  WearableCategory
   } from '@dcl/schemas'
import { IHttpServerComponent } from '@well-known-components/interfaces'
import { AppComponents, Context } from '../../types'
import { Params } from '../../logic/http/params'
import { HttpError, asJSON } from '../../logic/http/response'
import { NFTSortBy, 
  // WearableGender 
} from '../../ports/nfts/types'

export function createETHNFTsHandler(
  components: Pick<AppComponents, 'logs' | 'eth_nfts' >
): IHttpServerComponent.IRequestHandler<Context<'/eth_nfts'>> {
  const { eth_nfts } = components
  return async (context) => {
    const params = new Params(context.url.searchParams)    
    const first = params.getNumber('first')
    const skip = params.getNumber('skip')
    const sortBy = params.getValue<NFTSortBy>('sortBy', NFTSortBy)
    const category = params.getValue<NFTCategory>('category', NFTCategory)
    const owner = params.getAddress('owner')
    const isOnSale = params.getBoolean('isOnSale')
    const search = params.getString('search')
    const isLand = params.getBoolean('isLand')
    
    const contractAddresses = params.getAddressList('contractAddress')
    const tokenId = params.getString('tokenId')
    const network = params.getValue<Network>('network', Network)

    return asJSON(() =>
      eth_nfts.fetchAndCount({
        first,
        skip,
        sortBy,
        category,
        owner,
        isOnSale,
        search,
        isLand,
        contractAddresses,
        tokenId,
        network,
      })
    )
  }
}

export function createETHNFTHandler(
  components: Pick<AppComponents, 'logs' | 'eth_nfts'>
): IHttpServerComponent.IRequestHandler<
  Context<'/contracts/:contractAddress/eth/tokens/:tokenId'>
> {
  const { eth_nfts } = components
  return async (context) => {
    const { contractAddress, tokenId } = context.params

    return asJSON(async () => {
      const results = await eth_nfts.fetch({
        contractAddresses: [contractAddress],
        tokenId,
      })

      if (results.length === 0) {
        throw new HttpError('Not Found', 404)
      }

      return results[0]
    })
  }
}

export function createBSCNFTsHandler(
  components: Pick<AppComponents, 'logs' | 'bsc_nfts' >
): IHttpServerComponent.IRequestHandler<Context<'/bsc_nfts'>> {
  const { bsc_nfts } = components
  return async (context) => {
    const params = new Params(context.url.searchParams)    
    const first = params.getNumber('first')
    const skip = params.getNumber('skip')
    const sortBy = params.getValue<NFTSortBy>('sortBy', NFTSortBy)
    const category = params.getValue<NFTCategory>('category', NFTCategory)
    const owner = params.getAddress('owner')
    const isOnSale = params.getBoolean('isOnSale')
    const search = params.getString('search')
    const isLand = params.getBoolean('isLand')
    
    const contractAddresses = params.getAddressList('contractAddress')
    const tokenId = params.getString('tokenId')
    const network = params.getValue<Network>('network', Network)

    return asJSON(() =>
      bsc_nfts.fetchAndCount({
        first,
        skip,
        sortBy,
        category,
        owner,
        isOnSale,
        search,
        isLand,
        contractAddresses,
        tokenId,
        network,
      })
    )
  }
}

export function createBSCNFTHandler(
  components: Pick<AppComponents, 'logs' | 'bsc_nfts'>
): IHttpServerComponent.IRequestHandler<
  Context<'/contracts/:contractAddress/bsc/tokens/:tokenId'>
> {
  const { bsc_nfts } = components
  return async (context) => {
    const { contractAddress, tokenId } = context.params

    return asJSON(async () => {
      const results = await bsc_nfts.fetch({
        contractAddresses: [contractAddress],
        tokenId,
      })

      if (results.length === 0) {
        throw new HttpError('Not Found', 404)
      }

      return results[0]
    })
  }
}
