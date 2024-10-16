script {
    use aptos_framework::object;

    use bounty_app_addr::bounty_app;

    fun update_payment_allowlist(sender: &signer) {
        bounty_app::add_to_payment_allowlist(
            sender,
            // 0xa is APT in FA format
            object::address_to_object(@0xa),
        );
    }
}
