import { config as configDotEnvFile } from 'dotenv'
import { 
  // Bid,
   Contract,
  //  Item, 
   Network, Order } from '@dcl/schemas'
import { createConfigComponent } from '@well-known-components/env-config-provider'
import {
  createServerComponent,
  createStatusCheckComponent,
} from '@well-known-components/http-server'
import { createLogComponent } from '@well-known-components/logger'
import { Lifecycle } from '@well-known-components/interfaces'
import { createMetricsComponent } from '@well-known-components/metrics'
import { setupRoutes } from './adapters/routes'
import { AppComponents, AppConfig, GlobalContext } from './types'
import { createSubgraphComponent } from './ports/subgraph/component'
// import { createBidsComponent } from './ports/bids/component'
import { createOrdersComponent } from './ports/orders/component'
import { createMergerComponent } from './ports/merger/component'
import { OrderFilters, OrderSortBy } from './ports/orders/types'
import { SortDirection } from './ports/merger/types'
// import { BidFilters, BidSortBy } from './ports/bids/types'
import { 
  // getMarketplaceChainId,
  //  getCollectionsChainId,
   getETHMarketChainId,
   getBSCMarketChainId
   } from './logic/chainIds'
import { createOrdersSource } from './adapters/sources/orders'
import { createContractsComponent } from './ports/contracts/compontent'
// import { createBidsSource } from './adapters/sources/bids'
import { ContractFilters, ContractSortBy } from './ports/contracts/types'
import { createContractsSource } from './adapters/sources/contracts'
import { createNFTComponent } from './ports/nfts/component'
// import {
//   fromMarketplaceNFTFragment,
//   getMarketplaceExtraVariables,
//   getMarketplaceExtraWhere,
//   getMarketplaceFragment,
//   getMarketplaceOrderBy,
//   marketplaceShouldFetch,
// } from './logic/nfts/marketplace'

// import {
//   collectionsShouldFetch,
//   fromCollectionsFragment,
//   getCollectionsExtraVariables,
//   getCollectionsExtraWhere,
//   getCollectionsFragment,
//   getCollectionsOrderBy,
// } from './logic/nfts/collections'
import { NFTFilters, NFTResult, NFTSortBy } from './ports/nfts/types'
import { NFT_DEFAULT_SORT_BY } from './ports/nfts/utils'
import { createNFTsSource } from './adapters/sources/nfts'
import {
  // getCollectionsContracts,
  // getMarketplaceContracts,
  getETHMarketplaceContracts,
  getBSCMarketplaceContracts
} from './logic/contracts'
// import { BID_DEFAULT_SORT_BY } from './ports/bids/utils'
import { ORDER_DEFAULT_SORT_BY } from './ports/orders/utils'
import { fromETHMarketplaceNFTFragment, 
  getETHMarketplaceExtraVariables,
  getETHMarketplaceExtraWhere,
  getETHMarketplaceFragment,
  getETHMarketplaceOrderBy,
  ETHmarketplaceShouldFetch
 } from './logic/nfts/ETHmarketplace'
 import { fromBSCMarketplaceNFTFragment, 
  getBSCMarketplaceExtraVariables,
  getBSCMarketplaceExtraWhere,
  getBSCMarketplaceFragment,
  getBSCMarketplaceOrderBy,
  BSCmarketplaceShouldFetch
 } from './logic/nfts/BSCmarketplace'
// import { ItemFilters, ItemSortBy } from './ports/items/types'
// import { createItemsSource } from './adapters/sources/items'
// import { createItemsComponent } from './ports/items/component'
// import { ITEM_DEFAULT_SORT_BY } from './ports/items/utils'

async function main(components: AppComponents) {
  const globalContext: GlobalContext = {
    components,
  }

  await setupRoutes(globalContext)
}

async function initComponents(): Promise<AppComponents> {
  configDotEnvFile()

  // default config
  const defaultValues: Partial<AppConfig> = {
    HTTP_SERVER_PORT: '5000',
    HTTP_SERVER_HOST: '0.0.0.0',
    API_VERSION: 'v1',
  }

  const config = createConfigComponent(process.env, defaultValues)

  const cors = {
    origin: await config.getString('CORS_ORIGIN'),
    method: await config.getString('CORS_METHOD'),
  }

  const logs = createLogComponent()
  const server = await createServerComponent<GlobalContext>(
    { config, logs },
    { cors, compression: {} }
  )

  const statusChecks = await createStatusCheckComponent({ server })

  const metrics = await createMetricsComponent(
    {},
    {
      server,
      config,
    }
  )

  // chain ids
  // const marketplaceChainId = getMarketplaceChainId()
  // const collectionsChainId = getCollectionsChainId()
  const ETHmarketplaceChainId = getETHMarketChainId()
  const BSCmarketplaceChainId = getBSCMarketChainId()

  // subgraphs
  // const marketplaceSubgraph = createSubgraphComponent(
  //   await config.requireString('MARKETPLACE_SUBGRAPH_URL')
  // )

  // const collectionsSubgraph = createSubgraphComponent(
  //   await config.requireString('COLLECTIONS_SUBGRAPH_URL')
  // )

  const ETHmarketplaceSubgraph = createSubgraphComponent(
    await config.requireString('ETH_MARKETPLACE_SUBGRAPH_URL')
  )

  const BSCmarketplaceSubgraph = createSubgraphComponent(
    await config.requireString('BSC_MARKETPLACE_SUBGRAPH_URL')
  )


  // orders
  // const marketplaceOrders = createOrdersComponent({
  //   subgraph: marketplaceSubgraph,
  //   network: Network.ETHEREUM,
  //   chainId: marketplaceChainId,
  // })

  // const collectionsOrders = createOrdersComponent({
  //   subgraph: collectionsSubgraph,
  //   network: Network.MATIC,
  //   chainId: collectionsChainId,
  // })

  const ETHmarketplaceOrders = createOrdersComponent({
    subgraph: ETHmarketplaceSubgraph,
    network: Network.ETHEREUM,
    chainId: ETHmarketplaceChainId,
  })

  const BSCmarketplaceOrders = createOrdersComponent({
    subgraph: BSCmarketplaceSubgraph,
    network: Network.BSC,
    chainId: BSCmarketplaceChainId,
  })


  const orders = createMergerComponent<Order, OrderFilters, OrderSortBy>({
    sources: [
      createOrdersSource(ETHmarketplaceOrders),
      createOrdersSource(BSCmarketplaceOrders),
    ],
    defaultSortBy: ORDER_DEFAULT_SORT_BY,
    directions: {
      [OrderSortBy.RECENTLY_LISTED]: SortDirection.DESC,
      [OrderSortBy.RECENTLY_UPDATED]: SortDirection.DESC,
      [OrderSortBy.CHEAPEST]: SortDirection.ASC,
    },
    maxCount: 1000,
  })

  // bids
  // const marketplaceBids = createBidsComponent({
  //   subgraph: marketplaceSubgraph,
  //   network: Network.ETHEREUM,
  //   chainId: marketplaceChainId,
  // })

  // const bids = createMergerComponent<Bid, BidFilters, BidSortBy>({
  //   sources: [createBidsSource(marketplaceBids)],
  //   defaultSortBy: BID_DEFAULT_SORT_BY,
  //   directions: {
  //     [BidSortBy.RECENTLY_OFFERED]: SortDirection.DESC,
  //     [BidSortBy.RECENTLY_UPDATED]: SortDirection.DESC,
  //     [BidSortBy.MOST_EXPENSIVE]: SortDirection.DESC,
  //   },
  //   maxCount: 1000,
  // })

  // contracts
  // const marketplaceContracts = createContractsComponent({
  //   getContracts: () => getMarketplaceContracts(marketplaceChainId),
  //   network: Network.ETHEREUM,
  // })

  // const collectionsContracts = createContractsComponent({
  //   getContracts: () =>
  //     getCollectionsContracts(
  //       collectionsSubgraph,
  //       Network.MATIC,
  //       collectionsChainId
  //     ),
  //   network: Network.MATIC,
  // })

  const ETHmarketplaceContracts = createContractsComponent({
    getContracts: () => getETHMarketplaceContracts(ETHmarketplaceChainId),
    network: Network.ETHEREUM,
  })

  const BSCmarketplaceContracts = createContractsComponent({
    getContracts: () => getBSCMarketplaceContracts(BSCmarketplaceChainId),
    network: Network.BSC,
  })


  const contracts = createMergerComponent<
    Contract,
    ContractFilters,
    ContractSortBy
  >({
    sources: [
      // createContractsSource(marketplaceContracts),
      // createContractsSource(collectionsContracts),
      createContractsSource(ETHmarketplaceContracts),
      createContractsSource(BSCmarketplaceContracts),

    ],
    defaultSortBy: ContractSortBy.NAME,
    directions: {
      [ContractSortBy.NAME]: SortDirection.ASC,
    },
  })

  // nfts
  // const marketplaceNFTs = createNFTComponent({
  //   subgraph: marketplaceSubgraph,
  //   shouldFetch: marketplaceShouldFetch,
  //   fragmentName: 'marketplaceFragment',
  //   getFragment: getMarketplaceFragment,
  //   fromFragment: fromMarketplaceNFTFragment,
  //   getSortByProp: getMarketplaceOrderBy,
  //   getExtraVariables: getMarketplaceExtraVariables,
  //   getExtraWhere: getMarketplaceExtraWhere,
  // })

  // const collectionsNFTs = createNFTComponent({
  //   subgraph: collectionsSubgraph,
  //   shouldFetch: collectionsShouldFetch,
  //   fragmentName: 'collectionsFragment',
  //   getFragment: getCollectionsFragment,
  //   fromFragment: fromCollectionsFragment,
  //   getSortByProp: getCollectionsOrderBy,
  //   getExtraWhere: getCollectionsExtraWhere,
  //   getExtraVariables: getCollectionsExtraVariables,
  // })

  const ETHmarketplaceNFTs = createNFTComponent({
    subgraph: ETHmarketplaceSubgraph,
    shouldFetch: ETHmarketplaceShouldFetch,
    fragmentName: 'ETHmarketplaceFragment',
    getFragment: getETHMarketplaceFragment,
    fromFragment: fromETHMarketplaceNFTFragment,
    getSortByProp: getETHMarketplaceOrderBy,
    getExtraVariables: getETHMarketplaceExtraVariables,
    getExtraWhere: getETHMarketplaceExtraWhere,
  })

  const BSCmarketplaceNFTs = createNFTComponent({
    subgraph: BSCmarketplaceSubgraph,
    shouldFetch: BSCmarketplaceShouldFetch,
    fragmentName: 'BSCmarketplaceFragment',
    getFragment: getBSCMarketplaceFragment,
    fromFragment: fromBSCMarketplaceNFTFragment,
    getSortByProp: getBSCMarketplaceOrderBy,
    getExtraVariables: getBSCMarketplaceExtraVariables,
    getExtraWhere: getBSCMarketplaceExtraWhere,
  })



  const nfts = createMergerComponent<NFTResult, NFTFilters, NFTSortBy>({
    sources: [
      // createNFTsSource(marketplaceNFTs),
      // createNFTsSource(collectionsNFTs),
      createNFTsSource(ETHmarketplaceNFTs),
      createNFTsSource(BSCmarketplaceNFTs),
    ],
    defaultSortBy: NFT_DEFAULT_SORT_BY,
    directions: {
      [NFTSortBy.CHEAPEST]: SortDirection.ASC,
      [NFTSortBy.NAME]: SortDirection.ASC,
      [NFTSortBy.NEWEST]: SortDirection.DESC,
      [NFTSortBy.RECENTLY_LISTED]: SortDirection.DESC,
    },
    maxCount: 1000,
  })

  

  // items
  // const collectionsItems = createItemsComponent({
  //   subgraph: collectionsSubgraph,
  //   network: Network.MATIC,
  //   chainId: collectionsChainId,
  // })

  // const items = createMergerComponent<Item, ItemFilters, ItemSortBy>({
  //   sources: [createItemsSource(collectionsItems)],
  //   defaultSortBy: ITEM_DEFAULT_SORT_BY,
  //   directions: {
  //     [ItemSortBy.NEWEST]: SortDirection.DESC,
  //     [ItemSortBy.RECENTLY_REVIEWED]: SortDirection.DESC,
  //     [ItemSortBy.NAME]: SortDirection.ASC,
  //     [ItemSortBy.CHEAPEST]: SortDirection.ASC,
  //   },
  //   maxCount: 1000,
  // })

  return {
    config,
    logs,
    server,
    statusChecks,
    metrics,
    orders,
    // bids,
    contracts,
    nfts,
    // items,
  }
}

Lifecycle.programEntryPoint({
  main,
  initComponents,
}).catch((error) => console.error('Error staring app lifecycle', error))
