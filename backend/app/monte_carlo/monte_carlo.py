
def normal_monte_carlo():
        # Revenue Parameters
        wtp_standard_dist = get_distribution(model_variables, "willingness_to_pay_standard")
        wtp_premium_dist = get_distribution(model_variables, "willingness_to_pay_premium")
        num_standard_users_dist = get_distribution(model_variables, "num_standard_users_per_deal")
        num_premium_users_dist = get_distribution(model_variables, "num_premium_users_per_deal")
        num_deals_dist = get_distribution(model_variables, "num_deals_per_year")
        discount_dist = get_distribution(model_variables, "expected_discount_per_deal")

        number_of_simulations = 10000

        # Run Monte Carlo simulations
        results = []
        for _ in range(number_of_simulations):
            wtp_standard = wtp_standard_dist.rvs()
            wtp_premium = wtp_premium_dist.rvs()
            num_standard_users = num_standard_users_dist.rvs()
            num_premium_users = num_premium_users_dist.rvs()
            num_deals = num_deals_dist.rvs()
            discount = discount_dist.rvs()
            
            total_revenue = (
                num_deals * (
                    num_standard_users * wtp_standard +
                    num_premium_users * wtp_premium
                ) * (1 - discount)
            )

            results.append(total_revenue)

        num_bins = int(np.sqrt(number_of_simulations))
        frequencies, bin_edges = np.histogram(results, bins=num_bins)
        
        # Compute summary statistics
        mean_outcome = np.mean(results)
        median_outcome = np.median(results)
        std_dev = np.std(results)
        min_outcome = np.min(results)
        max_outcome = np.max(results)
        percentile_5 = np.percentile(results, 5)
        percentile_95 = np.percentile(results, 95)