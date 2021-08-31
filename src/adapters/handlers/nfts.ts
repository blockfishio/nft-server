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

export function createNFTsHandler(
  components: Pick<AppComponents, 'logs' | 'nfts' >
): IHttpServerComponent.IRequestHandler<Context<'/nfts'>> {
  const { nfts } = components
  return async (context) => {
    const params = new Params(context.url.searchParams)    
    const first = params.getNumber('first')
    const skip = params.getNumber('skip')
    const sortBy = params.getValue<NFTSortBy>('sortBy', NFTSortBy)
    const category = params.getValue<NFTCategory>('category', NFTCategory)
    const owner = params.getAddress('owner')
    const ownernot=params.getAddress('ownernot')
    const isOnSale = params.getBoolean('isOnSale')
    const search = params.getString('search')
    const isLand = params.getBoolean('isLand')
    
    const contractAddresses = params.getAddressList('contractAddress')
    const tokenId = params.getString('tokenId')
    const network = params.getValue<Network>('network', Network)
    

    return asJSON(() =>
      nfts.fetchAndCount({
        first,
        skip,
        sortBy,
        category,
        owner,
        ownernot,
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

export function createNFTHandler(
  components: Pick<AppComponents, 'logs' | 'nfts'>
): IHttpServerComponent.IRequestHandler<
  Context<'/contracts/:contractAddress/tokens/:tokenId'>
> {
  const { nfts } = components
  return async (context) => {
    const { contractAddress, tokenId } = context.params

    return asJSON(async () => {
      const results = await nfts.fetch({
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




