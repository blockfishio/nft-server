import {
  Network,
  NFTCategory,
  // Rarity,
} from '@dcl/schemas'
import { NFTFilters, NFTResult, NFTSortBy } from '../../ports/nfts/types'
import { 
  // getId,
   NFT_DEFAULT_SORT_BY } from '../../ports/nfts/utils'
import { OrderFragment } from '../../ports/orders/types'
import { fromOrderFragment, getOrderFields } from '../../ports/orders/utils'
import { getBSCMarketChainId } from '../chainIds'
import { isExpired } from '../expiration'
import { capitalize } from '../string'

export const getBSCMarketplaceFields = () => `
  fragment BSCmarketplaceFields on NFT {
    id
    name
    contractAddress
    tokenId
    category
    image
    thumbnail
    owner {
      address
    }
    boardingpass {
      id
      description
    }
    land {
      id
      x
      y
      description
    }
    building {
      id
      description
      rarity
    }
    tower {
      id
      description
      rarity
    }
    trap {
      id
      description
      rarity
    }
    createdAt
    updatedAt
    searchOrderPrice
    searchOrderCreatedAt
  }
`

export const getBSCMarketplaceFragment = () => `
  fragment BSCmarketplaceFragment on NFT {
    ...BSCmarketplaceFields
    activeOrder {
      ...orderFields
    }
  }
  ${getBSCMarketplaceFields()}
  ${getOrderFields()}
`

export type BSCMarketplaceNFTFields = {
  id: string
  name: string | null
  image: string | null
  contractAddress: string
  thumbnail:string | null
  tokenId: string
  category: NFTCategory
  owner: { address: string }
  boardingpass?: {
    id:string
    description:string
  }
  land? :{
    id:string
    x:string
    y:string
    description:string
  }
  building? :{
    id:string
    description:string
    rarity:string
  }
  tower?: {
    id:string
    description:string
    rarity:string
  }
  trap?: {
    id:string
    description:string
    rarity:string
  }
  
  
  createdAt: string
  updatedAt: string
  searchOrderPrice: string
  searchOrderCreatedAt: string
}

export type BSCMarketplaceNFTFragment = BSCMarketplaceNFTFields & {
  activeOrder: OrderFragment | null
}

export function getBSCMarketplaceOrderBy(
  sortBy?: NFTSortBy
): keyof BSCMarketplaceNFTFragment {
  switch (sortBy) {
    case NFTSortBy.NEWEST:
      return 'createdAt'
    case NFTSortBy.NAME:
      return 'name'
    case NFTSortBy.RECENTLY_LISTED:
      return 'searchOrderCreatedAt'
    case NFTSortBy.CHEAPEST:
      return 'searchOrderPrice'
    default:
      return getBSCMarketplaceOrderBy(NFT_DEFAULT_SORT_BY)
  }
}

export function fromBSCMarketplaceNFTFragment(
  fragment: BSCMarketplaceNFTFragment
): NFTResult {
  const result: NFTResult = {
    nft: {
      // id: getId(fragment.contractAddress, fragment.tokenId),
      id:fragment.tokenId,
      tokenId: fragment.tokenId,
      contractAddress: fragment.contractAddress,
      activeOrderId:
        fragment.activeOrder && !isExpired(fragment.activeOrder.expiresAt)
          ? fragment.activeOrder.id
          : null,
      owner: fragment.owner.address.toLowerCase(),
      name: fragment.name || capitalize(fragment.category),
      image: fragment.image || '',
      thumbnail:fragment.thumbnail || '',
      url: `/contracts/${fragment.contractAddress}/bsc/tokens/${fragment.tokenId}`,
      data: {
        land: fragment.land
          ? {
              description:
                fragment.land.description
                ,
              x: fragment.land.x,
              y: fragment.land.y,
              id:fragment.id
            }
          : undefined,
        boardingpass: fragment.boardingpass
          ? {
              description:
                fragment.boardingpass.description
                ,
              id:fragment.id
            }
          : undefined,
          tower: fragment.tower
          ? {
              description:
                fragment.tower.description
                ,
              id:fragment.id,
              rarity:fragment.tower.rarity
            }
          : undefined,
          trap: fragment.trap
          ? {
              description:
                fragment.trap.description
                ,
              id:fragment.id,
              rarity:fragment.trap.rarity

            }
          : undefined,
          building: fragment.building
          ? {
              description:
                fragment.building.description
                ,
              id:fragment.id,
              rarity:fragment.building.rarity
            }
          : undefined,
      },
      issuedId: null,
      itemId: null,
      category: fragment.category,
      network: Network.BSC,
      chainId: getBSCMarketChainId(),
      createdAt: +fragment.createdAt * 1000,
      updatedAt: +fragment.updatedAt * 1000,
    },
    order:
      fragment.activeOrder && !isExpired(fragment.activeOrder.expiresAt)
        ? fromBSCMarketplaceOrderFragment(fragment.activeOrder)
        : null,
  }

  // remove undefined data
  for (const property of Object.keys(result.nft.data)) {
    const key = property as keyof typeof result.nft.data
    if (typeof result.nft.data[key] === 'undefined') {
      delete result.nft.data[key]
    }
  }

  return result
}

export function getBSCMarketplaceExtraVariables(options: NFTFilters) {
  const extraVariables: string[] = []
  if (options.category) {
    extraVariables.push('$category: Category')
  }
  return extraVariables
}

export function getBSCMarketplaceExtraWhere(options: NFTFilters) {
  // const extraWhere = ['searchEstateSize_gt: 0', 'searchParcelIsInBounds: true']
  const extraWhere=[]
  if (options.category) {
    extraWhere.push('category: $category')
  }
  if (options.isLand) {
    extraWhere.push('searchIsLand: true')
  }
  return extraWhere
  // return []
}

export function fromBSCMarketplaceOrderFragment(fragment: OrderFragment) {
  return fromOrderFragment(fragment, Network.BSC, getBSCMarketChainId())
}

export function BSCmarketplaceShouldFetch(filters: NFTFilters) {
  if (
    (filters.network && filters.network !== Network.BSC) 
    // ||
    //  filters.itemId
  ) {
    return false
  }

  return true
}
