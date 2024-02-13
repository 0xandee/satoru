// *************************************************************************
//                                  IMPORTS
// *************************************************************************

// Core lib imports.

use result::ResultTrait;
use debug::PrintTrait;
use traits::{TryInto, Into};
use starknet::{
    ContractAddress, get_caller_address, Felt252TryIntoContractAddress, contract_address_const,
    ClassHash,
};
use snforge_std::{declare, start_prank, stop_prank, start_roll, ContractClassTrait, ContractClass};


// Local imports.
use satoru::data::data_store::{IDataStoreDispatcher, IDataStoreDispatcherTrait};
use satoru::role::role_store::{IRoleStoreDispatcher, IRoleStoreDispatcherTrait};
use satoru::market::market_factory::{IMarketFactoryDispatcher, IMarketFactoryDispatcherTrait};
use satoru::event::event_emitter::{IEventEmitterDispatcher, IEventEmitterDispatcherTrait};
use satoru::deposit::deposit_vault::{IDepositVaultDispatcher, IDepositVaultDispatcherTrait};
use satoru::exchange::deposit_handler::{IDepositHandlerDispatcher, IDepositHandlerDispatcherTrait};
use satoru::router::exchange_router::{IExchangeRouterDispatcher, IExchangeRouterDispatcherTrait};
use satoru::market::market::{Market, UniqueIdMarket};
use satoru::market::market_token::{IMarketTokenDispatcher, IMarketTokenDispatcherTrait};
use satoru::role::role;
use satoru::oracle::oracle_utils::SetPricesParams;
use satoru::tests_lib;
use satoru::deposit::deposit_utils::CreateDepositParams;
use satoru::utils::span32::{Span32, DefaultSpan32, Array32Trait};
use satoru::deposit::deposit_utils;
use satoru::bank::bank::{IBankDispatcherTrait, IBankDispatcher};
use satoru::bank::strict_bank::{IStrictBankDispatcher, IStrictBankDispatcherTrait};
use satoru::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
use satoru::oracle::oracle::{IOracleDispatcher, IOracleDispatcherTrait};
use satoru::data::keys;

const INITIAL_TOKENS_MINTED: felt252 = 1000;


// #[test]
// #[should_panic(expected: ('unauthorized_access',))]
// fn given_normal_conditions_when_create_market_and_add_liquidity_then_market_is_created() {
//     // *********************************************************************************************
//     // *                              SETUP                                                        *
//     // *********************************************************************************************
//     let (
//         caller_address,
//         market_factory_address,
//         role_store_address,
//         data_store_address,
//         market_token_class_hash,
//         market_factory,
//         role_store,
//         data_store,
//         event_emitter,
//         exchange_router,
//         deposit_handler,
//         deposit_vault,
//         oracle,
//     ) =
//         setup();

//     // *********************************************************************************************
//     // *                              TEST LOGIC                                                   *
//     // *********************************************************************************************

//     // Create a market.
//     let market = data_store.get_market(create_market(market_factory));
//     // Set params in data_store
//     data_store.set_address(keys::fee_token(), market.index_token);

//     let user1: ContractAddress = contract_address_const::<'user1'>();
//     let user2: ContractAddress = contract_address_const::<'user2'>();

//     let addresss_zero: ContractAddress = 0.try_into().unwrap();

//     let params = CreateDepositParams {
//         receiver: user1,
//         callback_contract: user2,
//         ui_fee_receiver: addresss_zero,
//         market: market.market_token,
//         initial_long_token: market.long_token,
//         initial_short_token: market.short_token,
//         long_token_swap_path: Default::default(),
//         short_token_swap_path: Default::default(),
//         min_market_tokens: 0,
//         execution_fee: 0,
//         callback_gas_limit: 0,
//     };
//     IERC20Dispatcher { contract_address: market.long_token }
//         .mint(deposit_vault.contract_address, 100000000000000);
//     IERC20Dispatcher { contract_address: market.short_token }
//         .mint(deposit_vault.contract_address, 50000000000);
//     start_roll(deposit_handler.contract_address, 1910);
//     let key = deposit_handler.create_deposit(caller_address, params);
//     let first_deposit = data_store.get_deposit(key);

//     assert(first_deposit.account == caller_address, 'Wrong account depositer');
//     assert(first_deposit.receiver == user1, 'Wrong account receiver');
//     assert(first_deposit.initial_long_token == market.long_token, 'Wrong initial long token');
//     assert(
//         first_deposit.initial_long_token_amount == 1000000000000000000,
//         'Wrong initial long token amount'
//     );
//     assert(
//         first_deposit.initial_short_token_amount == 50000000000, 'Wrong init short token amount'
//     );

//     let price_params = SetPricesParams {
//         signer_info: 1,
//         tokens: array![contract_address_const::<'ETH'>(), contract_address_const::<'USDC'>()],
//         compacted_min_oracle_block_numbers: array![1900, 1900],
//         compacted_max_oracle_block_numbers: array![1910, 1910],
//         compacted_oracle_timestamps: array![9999, 9999],
//         compacted_decimals: array![18, 18],
//         compacted_min_prices: array![4294967346000000], // 50000000, 1000000 compacted
//         compacted_min_prices_indexes: array![0],
//         compacted_max_prices: array![4294967346000000], // 50000000, 1000000 compacted
//         compacted_max_prices_indexes: array![0],
//         signatures: array![
//             array!['signatures1', 'signatures2'].span(), array!['signatures1', 'signatures2'].span()
//         ],
//         price_feed_tokens: array![]
//     };

//     start_roll(deposit_handler.contract_address, 1915);
//     deposit_handler.execute_deposit(key, price_params);

//     // *********************************************************************************************
//     // *                              TEARDOWN                                                     *
//     // *********************************************************************************************
//     teardown(data_store, market_factory);
// }

#[test]
fn test_deposit_market_integration() {
    // *********************************************************************************************
    // *                              SETUP                                                        *
    // *********************************************************************************************
    let (
        caller_address,
        market_factory_address,
        role_store_address,
        data_store_address,
        market_token_class_hash,
        market_factory,
        role_store,
        data_store,
        event_emitter,
        exchange_router,
        deposit_handler,
        deposit_vault,
        oracle,
    ) =
        setup();

    // *********************************************************************************************
    // *                              TEST LOGIC                                                   *
    // *********************************************************************************************

    // Create a market.
    let market = data_store.get_market(create_market(market_factory));
    // Set params in data_store
    data_store.set_address(keys::fee_token(), market.index_token);
    data_store.set_u128(keys::max_swap_path_length(), 0);
    data_store
        .set_u128(
            keys::max_pool_amount_key(market.market_token, market.long_token), 10000000000000
        );
    data_store
        .set_u128(
            keys::max_pool_amount_key(market.market_token, market.short_token), 10000000000000
        );

    IERC20Dispatcher { contract_address: market.long_token }.mint(market.market_token, 1000000);

    IERC20Dispatcher { contract_address: market.short_token }.mint(market.market_token, 1000000);

    let user1: ContractAddress = contract_address_const::<'user1'>();
    let user2: ContractAddress = contract_address_const::<'user2'>();

    let addresss_zero: ContractAddress = 0.try_into().unwrap();

    let params = CreateDepositParams {
        receiver: user1,
        callback_contract: user2,
        ui_fee_receiver: addresss_zero,
        market: market.market_token,
        initial_long_token: market.long_token,
        initial_short_token: market.short_token,
        long_token_swap_path: Array32Trait::<ContractAddress>::span32(@array![]),
        short_token_swap_path: Array32Trait::<ContractAddress>::span32(@array![]),
        min_market_tokens: 0,
        execution_fee: 0,
        callback_gas_limit: 0,
    };
    IERC20Dispatcher { contract_address: market.long_token }
        .mint(deposit_vault.contract_address, 1000000);
    IERC20Dispatcher { contract_address: market.short_token }
        .mint(deposit_vault.contract_address, 1000000);
    start_roll(deposit_handler.contract_address, 1910);
    let key = deposit_handler.create_deposit(caller_address, params);
    let first_deposit = data_store.get_deposit(key);

    assert(first_deposit.account == caller_address, 'Wrong account depositer');
    assert(first_deposit.receiver == user1, 'Wrong account receiver');
    assert(first_deposit.initial_long_token == market.long_token, 'Wrong initial long token');
    assert(first_deposit.initial_long_token_amount == 1000000, 'Wrong initial long token amount');
    assert(first_deposit.initial_short_token_amount == 1000000, 'Wrong init short token amount');

    let price_params = SetPricesParams {
        signer_info: 1,
        tokens: array![contract_address_const::<'ETH'>(), contract_address_const::<'USDC'>()],
        compacted_min_oracle_block_numbers: array![1900, 1900],
        compacted_max_oracle_block_numbers: array![1910, 1910],
        compacted_oracle_timestamps: array![9999, 9999],
        compacted_decimals: array![18, 18],
        compacted_min_prices: array![4294967346000000], // 50000000, 1000000 compacted
        compacted_min_prices_indexes: array![0],
        compacted_max_prices: array![4294967346000000], // 50000000, 1000000 compacted
        compacted_max_prices_indexes: array![0],
        signatures: array![
            array!['signatures1', 'signatures2'].span(), array!['signatures1', 'signatures2'].span()
        ],
        price_feed_tokens: array![]
    };

    start_prank(role_store.contract_address, caller_address);

    // Grant the caller the `ORDER_KEEPER` role.
    role_store.grant_role(caller_address, role::ORDER_KEEPER);
    role_store.grant_role(caller_address, role::ROLE_ADMIN);
    role_store.grant_role(caller_address, role::TIMELOCK_ADMIN);
    role_store.grant_role(caller_address, role::TIMELOCK_MULTISIG);
    role_store.grant_role(caller_address, role::CONFIG_KEEPER);
    role_store.grant_role(caller_address, role::CONTROLLER);
    role_store.grant_role(caller_address, role::ROUTER_PLUGIN);
    role_store.grant_role(caller_address, role::MARKET_KEEPER);
    role_store.grant_role(caller_address, role::FEE_KEEPER);

    role_store.grant_role(caller_address, role::FROZEN_ORDER_KEEPER);
    role_store.grant_role(caller_address, role::PRICING_KEEPER);
    role_store.grant_role(caller_address, role::LIQUIDATION_KEEPER);
    role_store.grant_role(caller_address, role::ADL_KEEPER);
    role_store.grant_role(caller_address, role::FEE_KEEPER);

    start_roll(deposit_handler.contract_address, 1915);
    deposit_handler.execute_deposit(key, price_params);

    // IERC20Dispatcher{ contract_address: market.market_token }.balance_of(caller_address);

    // *********************************************************************************************
    // *                              TEARDOWN                                                     *
    // *********************************************************************************************
    teardown(data_store, market_factory);
}

fn create_market(market_factory: IMarketFactoryDispatcher) -> ContractAddress {
    // Create a market.
    let (index_token, short_token) = deploy_tokens();
    let market_type = 'market_type';

    // Index token is the same as long token here.
    market_factory.create_market(index_token, index_token, short_token, market_type)
}

/// Utility functions to deploy tokens for a market.
fn deploy_tokens() -> (ContractAddress, ContractAddress) {
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let contract = declare('ERC20');

    let eth_address = contract_address_const::<'ETH'>();
    let constructor_calldata = array!['Ethereum', 'ETH', 1000000, 0, caller_address.into()];
    contract.deploy_at(@constructor_calldata, eth_address).unwrap();

    let usdc_address = contract_address_const::<'USDC'>();
    let constructor_calldata = array!['usdc', 'USDC', 1000000, 0, caller_address.into()];
    contract.deploy_at(@constructor_calldata, usdc_address).unwrap();
    (eth_address, usdc_address)
}

/// Utility function to setup the test environment.
fn setup() -> (
    // This caller address will be used with `start_prank` cheatcode to mock the caller address.,
    ContractAddress,
    // Address of the `MarketFactory` contract.
    ContractAddress,
    // Address of the `RoleStore` contract.
    ContractAddress,
    // Address of the `DataStore` contract.
    ContractAddress,
    // The `MarketToken` class hash for the factory.
    ContractClass,
    // Interface to interact with the `MarketFactory` contract.
    IMarketFactoryDispatcher,
    // Interface to interact with the `RoleStore` contract.
    IRoleStoreDispatcher,
    // Interface to interact with the `DataStore` contract.
    IDataStoreDispatcher,
    // Interface to interact with the `EventEmitter` contract.
    IEventEmitterDispatcher,
    // Interface to interact with the `ExchangeRouter` contract.
    IExchangeRouterDispatcher,
    // Interface to interact with the `DepositHandler` contract.
    IDepositHandlerDispatcher,
    // Interface to interact with the `DepositHandler` contract.
    IDepositVaultDispatcher,
    IOracleDispatcher,
) {
    let (
        caller_address,
        market_factory_address,
        role_store_address,
        data_store_address,
        market_token_class_hash,
        market_factory,
        role_store,
        data_store,
        event_emitter,
        exchange_router,
        deposit_handler,
        deposit_vault,
        oracle,
    ) =
        setup_contracts();
    grant_roles_and_prank(caller_address, role_store, data_store, market_factory);
    (
        caller_address,
        market_factory.contract_address,
        role_store_address,
        data_store_address,
        market_token_class_hash,
        market_factory,
        role_store,
        data_store,
        event_emitter,
        exchange_router,
        deposit_handler,
        deposit_vault,
        oracle,
    )
}

// Utility function to grant roles and prank the caller address.
/// Grants roles and pranks the caller address.
///
/// # Arguments
///
/// * `caller_address` - The address of the caller.
/// * `role_store` - The interface to interact with the `RoleStore` contract.
/// * `data_store` - The interface to interact with the `DataStore` contract.
/// * `market_factory` - The interface to interact with the `MarketFactory` contract.
fn grant_roles_and_prank(
    caller_address: ContractAddress,
    role_store: IRoleStoreDispatcher,
    data_store: IDataStoreDispatcher,
    market_factory: IMarketFactoryDispatcher,
) {
    start_prank(role_store.contract_address, caller_address);

    // Grant the caller the `CONTROLLER` role.
    role_store.grant_role(caller_address, role::CONTROLLER);

    // Grant the call the `MARKET_KEEPER` role.
    // This role is required to create a market.
    role_store.grant_role(caller_address, role::MARKET_KEEPER);

    // Prank the caller address for calls to `DataStore` contract.
    // We need this so that the caller has the CONTROLLER role.
    start_prank(data_store.contract_address, caller_address);

    // Start pranking the `MarketFactory` contract. This is necessary to mock the behavior of the contract
    // for testing purposes.
    start_prank(market_factory.contract_address, caller_address);
}

/// Utility function to teardown the test environment.
fn teardown(data_store: IDataStoreDispatcher, market_factory: IMarketFactoryDispatcher) {
    stop_prank(data_store.contract_address);
    stop_prank(market_factory.contract_address);
}

/// Setup required contracts.
fn setup_contracts() -> (
    // This caller address will be used with `start_prank` cheatcode to mock the caller address.,
    ContractAddress,
    // Address of the `MarketFactory` contract.
    ContractAddress,
    // Address of the `RoleStore` contract.
    ContractAddress,
    // Address of the `DataStore` contract.
    ContractAddress,
    // The `MarketToken` class hash for the factory.
    ContractClass,
    // Interface to interact with the `MarketFactory` contract.
    IMarketFactoryDispatcher,
    // Interface to interact with the `RoleStore` contract.
    IRoleStoreDispatcher,
    // Interface to interact with the `DataStore` contract.
    IDataStoreDispatcher,
    // Interface to interact with the `EventEmitter` contract.
    IEventEmitterDispatcher,
    // Interface to interact with the `ExchangeRouter` contract.
    IExchangeRouterDispatcher,
    // Interface to interact with the `DepositHandler` contract.
    IDepositHandlerDispatcher,
    // Interface to interact with the `DepositHandler` contract.
    IDepositVaultDispatcher,
    IOracleDispatcher,
) {
    // Deploy the role store contract.
    let role_store_address = deploy_role_store();

    // Create a role store dispatcher.
    let role_store = IRoleStoreDispatcher { contract_address: role_store_address };

    // Deploy the contract.
    let data_store_address = deploy_data_store(role_store_address);
    // Create a safe dispatcher to interact with the contract.
    let data_store = IDataStoreDispatcher { contract_address: data_store_address };

    // Declare the `MarketToken` contract.
    let market_token_class_hash = declare_market_token();

    // Deploy the event emitter contract.
    let event_emitter_address = deploy_event_emitter();
    // Create a safe dispatcher to interact with the contract.
    let event_emitter = IEventEmitterDispatcher { contract_address: event_emitter_address };

    // Deploy the router contract.
    let router_address = deploy_router(role_store_address);

    // Deploy the market factory.
    let market_factory_address = deploy_market_factory(
        data_store_address, role_store_address, event_emitter_address, market_token_class_hash
    );
    // Create a safe dispatcher to interact with the contract.
    let market_factory = IMarketFactoryDispatcher { contract_address: market_factory_address };

    let oracle_store_address = deploy_oracle_store(role_store_address, event_emitter_address);
    let oracle_address = deploy_oracle(
        role_store_address, oracle_store_address, contract_address_const::<'pragma'>()
    );

    let oracle = IOracleDispatcher { contract_address: oracle_address };

    let deposit_vault_address = deploy_deposit_vault(role_store_address, data_store_address);

    let deposit_vault = IDepositVaultDispatcher { contract_address: deposit_vault_address };
    let deposit_handler_address = deploy_deposit_handler(
        data_store_address,
        role_store_address,
        event_emitter_address,
        deposit_vault_address,
        oracle_address
    );
    let deposit_handler = IDepositHandlerDispatcher { contract_address: deposit_handler_address };

    let withdrawal_vault_address = deploy_withdrawal_vault(data_store_address, role_store_address);
    let withdrawal_handler_address = deploy_withdrawal_handler(
        data_store_address,
        role_store_address,
        event_emitter_address,
        withdrawal_vault_address,
        oracle_address
    );

    let order_vault_address = deploy_order_vault(
        data_store.contract_address, role_store.contract_address
    );
    let swap_handler_address = deploy_swap_handler_address(role_store_address, data_store_address);
    let referral_storage_address = deploy_referral_storage(event_emitter_address);
    let order_handler_address = deploy_order_handler(
        data_store_address,
        role_store_address,
        event_emitter_address,
        order_vault_address,
        oracle_address,
        swap_handler_address,
        referral_storage_address
    );

    let exchange_router_address = deploy_exchange_router(
        router_address,
        data_store_address,
        role_store_address,
        event_emitter_address,
        deposit_handler_address,
        withdrawal_handler_address,
        order_handler_address
    );
    let exchange_router = IExchangeRouterDispatcher { contract_address: exchange_router_address };

    let bank_address = deploy_bank(data_store_address, role_store_address);

    //Create a safe dispatcher to interact with the Bank contract.
    let bank = IBankDispatcher { contract_address: bank_address };

    // Deploy the strict bank contract
    let strict_bank_address = deploy_strict_bank(data_store_address, role_store_address);

    //Create a safe dispatcher to interact with the StrictBank contract.
    let strict_bank = IStrictBankDispatcher { contract_address: strict_bank_address };

    (
        contract_address_const::<'caller'>(),
        market_factory_address,
        role_store_address,
        data_store_address,
        market_token_class_hash,
        market_factory,
        role_store,
        data_store,
        event_emitter,
        exchange_router,
        deposit_handler,
        deposit_vault,
        oracle,
    )
}

/// Utility function to declare a `MarketToken` contract.
fn declare_market_token() -> ContractClass {
    declare('MarketToken')
}

/// Utility function to deploy a market factory contract and return its address.
fn deploy_market_factory(
    data_store_address: ContractAddress,
    role_store_address: ContractAddress,
    event_emitter_address: ContractAddress,
    market_token_class_hash: ContractClass,
) -> ContractAddress {
    let contract = declare('MarketFactory');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'market_factory'>();
    start_prank(deployed_contract_address, caller_address);
    let mut constructor_calldata = array![];
    constructor_calldata.append(data_store_address.into());
    constructor_calldata.append(role_store_address.into());
    constructor_calldata.append(event_emitter_address.into());
    constructor_calldata.append(market_token_class_hash.class_hash.into());
    contract.deploy_at(@constructor_calldata, deployed_contract_address).unwrap()
}


fn deploy_data_store(role_store_address: ContractAddress) -> ContractAddress {
    let contract = declare('DataStore');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address: ContractAddress = 0x1.try_into().unwrap();
    start_prank(deployed_contract_address, caller_address);
    let constructor_calldata = array![role_store_address.into()];
    contract.deploy_at(@constructor_calldata, deployed_contract_address).unwrap()
}

fn deploy_role_store() -> ContractAddress {
    let contract = declare('RoleStore');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'role_store'>();
    start_prank(deployed_contract_address, caller_address);
    contract.deploy_at(@array![caller_address.into()], deployed_contract_address).unwrap()
}

fn deploy_event_emitter() -> ContractAddress {
    let contract = declare('EventEmitter');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'event_emitter'>();
    start_prank(deployed_contract_address, caller_address);
    contract.deploy_at(@array![], deployed_contract_address).unwrap()
}

fn deploy_router(role_store_address: ContractAddress) -> ContractAddress {
    let contract = declare('Router');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'router'>();
    start_prank(deployed_contract_address, caller_address);
    let constructor_calldata = array![role_store_address.into()];
    contract.deploy_at(@constructor_calldata, deployed_contract_address).unwrap()
}

fn deploy_deposit_handler(
    data_store_address: ContractAddress,
    role_store_address: ContractAddress,
    event_emitter_address: ContractAddress,
    deposit_vault_address: ContractAddress,
    oracle_address: ContractAddress
) -> ContractAddress {
    let contract = declare('DepositHandler');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'deposit_handler'>();
    start_prank(deployed_contract_address, caller_address);
    contract
        .deploy_at(
            @array![
                data_store_address.into(),
                role_store_address.into(),
                event_emitter_address.into(),
                deposit_vault_address.into(),
                oracle_address.into()
            ],
            deployed_contract_address
        )
        .unwrap()
}

fn deploy_oracle_store(
    role_store_address: ContractAddress, event_emitter_address: ContractAddress,
) -> ContractAddress {
    let contract = declare('OracleStore');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'oracle_store'>();
    start_prank(deployed_contract_address, caller_address);
    contract
        .deploy_at(
            @array![role_store_address.into(), event_emitter_address.into()],
            deployed_contract_address
        )
        .unwrap()
}

fn deploy_oracle(
    role_store_address: ContractAddress,
    oracle_store_address: ContractAddress,
    pragma_address: ContractAddress
) -> ContractAddress {
    let contract = declare('Oracle');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'oracle'>();
    start_prank(deployed_contract_address, caller_address);
    contract
        .deploy_at(
            @array![role_store_address.into(), oracle_store_address.into(), pragma_address.into()],
            deployed_contract_address
        )
        .unwrap()
}

fn deploy_deposit_vault(
    role_store_address: ContractAddress, data_store_address: ContractAddress
) -> ContractAddress {
    let contract = declare('DepositVault');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'deposit_vault'>();
    start_prank(deployed_contract_address, caller_address);
    contract
        .deploy_at(
            @array![data_store_address.into(), role_store_address.into()], deployed_contract_address
        )
        .unwrap()
}

fn deploy_withdrawal_handler(
    data_store_address: ContractAddress,
    role_store_address: ContractAddress,
    event_emitter_address: ContractAddress,
    withdrawal_vault_address: ContractAddress,
    oracle_address: ContractAddress
) -> ContractAddress {
    let contract = declare('WithdrawalHandler');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'withdrawal_handler'>();
    start_prank(deployed_contract_address, caller_address);
    let constructor_calldata = array![
        data_store_address.into(),
        role_store_address.into(),
        event_emitter_address.into(),
        withdrawal_vault_address.into(),
        oracle_address.into()
    ];
    contract.deploy_at(@constructor_calldata, deployed_contract_address).unwrap()
}

fn deploy_withdrawal_vault(
    data_store_address: ContractAddress, role_store_address: ContractAddress
) -> ContractAddress {
    let contract = declare('WithdrawalVault');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'withdrawal_vault'>();
    start_prank(deployed_contract_address, caller_address);
    let constructor_calldata = array![data_store_address.into(), role_store_address.into()];
    contract.deploy_at(@constructor_calldata, deployed_contract_address).unwrap()
}

fn deploy_order_handler(
    data_store_address: ContractAddress,
    role_store_address: ContractAddress,
    event_emitter_address: ContractAddress,
    order_vault_address: ContractAddress,
    oracle_address: ContractAddress,
    swap_handler_address: ContractAddress,
    referral_storage_address: ContractAddress
) -> ContractAddress {
    let contract = declare('OrderHandler');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'order_handler'>();
    start_prank(deployed_contract_address, caller_address);
    let constructor_calldata = array![
        data_store_address.into(),
        role_store_address.into(),
        event_emitter_address.into(),
        order_vault_address.into(),
        oracle_address.into(),
        swap_handler_address.into(),
        referral_storage_address.into()
    ];
    contract.deploy_at(@constructor_calldata, deployed_contract_address).unwrap()
}

fn deploy_swap_handler_address(
    role_store_address: ContractAddress, data_store_address: ContractAddress
) -> ContractAddress {
    let contract = declare('SwapHandler');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'swap_handler'>();
    start_prank(deployed_contract_address, caller_address);
    let constructor_calldata = array![role_store_address.into()];
    contract.deploy_at(@constructor_calldata, deployed_contract_address).unwrap()
}

fn deploy_referral_storage(event_emitter_address: ContractAddress) -> ContractAddress {
    let contract = declare('ReferralStorage');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'referral_storage'>();
    start_prank(deployed_contract_address, caller_address);
    let constructor_calldata = array![event_emitter_address.into()];
    contract.deploy_at(@constructor_calldata, deployed_contract_address).unwrap()
}

fn deploy_exchange_router(
    router_address: ContractAddress,
    data_store_address: ContractAddress,
    role_store_address: ContractAddress,
    event_emitter_address: ContractAddress,
    deposit_handler_address: ContractAddress,
    withdrawal_handler_address: ContractAddress,
    order_handler_address: ContractAddress
) -> ContractAddress {
    let contract = declare('ExchangeRouter');
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let deployed_contract_address = contract_address_const::<'exchange_router'>();
    start_prank(deployed_contract_address, caller_address);
    let constructor_calldata = array![
        router_address.into(),
        data_store_address.into(),
        role_store_address.into(),
        event_emitter_address.into(),
        deposit_handler_address.into(),
        withdrawal_handler_address.into(),
        order_handler_address.into()
    ];
    contract.deploy_at(@constructor_calldata, deployed_contract_address).unwrap()
}

fn deploy_order_vault(
    data_store_address: ContractAddress, role_store_address: ContractAddress,
) -> ContractAddress {
    let contract = declare('OrderVault');
    let mut constructor_calldata = array![];
    constructor_calldata.append(data_store_address.into());
    constructor_calldata.append(role_store_address.into());
    tests_lib::deploy_mock_contract(contract, @constructor_calldata)
}

fn deploy_bank(
    data_store_address: ContractAddress, role_store_address: ContractAddress,
) -> ContractAddress {
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let bank_address: ContractAddress = contract_address_const::<'bank'>();
    let contract = declare('Bank');
    let mut constructor_calldata = array![];
    constructor_calldata.append(data_store_address.into());
    constructor_calldata.append(role_store_address.into());
    start_prank(data_store_address, caller_address);
    contract.deploy_at(@constructor_calldata, bank_address).unwrap()
}

fn deploy_strict_bank(
    data_store_address: ContractAddress, role_store_address: ContractAddress,
) -> ContractAddress {
    let caller_address: ContractAddress = contract_address_const::<'caller'>();
    let strict_bank_address: ContractAddress = contract_address_const::<'strict_bank'>();
    let contract = declare('StrictBank');
    let mut constructor_calldata = array![];
    constructor_calldata.append(data_store_address.into());
    constructor_calldata.append(role_store_address.into());
    start_prank(strict_bank_address, caller_address);
    contract.deploy_at(@constructor_calldata, strict_bank_address).unwrap()
}

fn deploy_erc20_token(deposit_vault_address: ContractAddress) -> ContractAddress {
    let erc20_contract = declare('ERC20');
    let constructor_calldata3 = array![
        'satoru', 'STU', INITIAL_TOKENS_MINTED, 0, deposit_vault_address.into()
    ];
    erc20_contract.deploy(@constructor_calldata3).unwrap()
}
