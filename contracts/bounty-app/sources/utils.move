module bounty_app_addr::util {
    use std::signer;

    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin;
    use aptos_framework::fungible_asset::Metadata;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;

    // If sender is trying to pay APT but it doesn't have enough FA format APT, convert coin APT to FA APT
    // If payment FA is not APT, do nothing
    // If sender has enough FA APT, do nothing
    public entry fun convert_coin_to_fa_if_payment_is_apt(sender: &signer, fa_metadata: Object<Metadata>, amount: u64) {
        if (object::object_address(&fa_metadata) != @0xa) {
            return
        };

        let sender_addr = signer::address_of(sender);
        let apt_fa_metadata = object::address_to_object<Metadata>(@0xa);
        if (primary_fungible_store::is_balance_at_least(sender_addr, apt_fa_metadata, amount)) {
            return
        };

        let coin_apt = coin::withdraw<AptosCoin>(sender, amount);
        let fa_apt = coin::coin_to_fungible_asset(coin_apt);
        primary_fungible_store::deposit(sender_addr, fa_apt);
    }
}
