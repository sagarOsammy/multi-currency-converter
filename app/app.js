class CurrencyConverter {
    constructor() {
        this.config = {
            primaryAPI: 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/',
            fallbackAPI: 'https://latest.currency-api.pages.dev/v1/currencies/',
            defaultCurrencies: ['USD', 'EUR', 'GBP'],
            debounceDelay: 300,
            cacheTimeout: 300000, // 5 minutes
            precision: {
                'USD': 2, 'EUR': 2, 'GBP': 2, 'JPY': 0, 'KRW': 0, 
                'BHD': 3, 'JOD': 3, 'KWD': 3, 'OMR': 3, 'TND': 3
            }
        };

        this.state = {
            currencies: new Map(),
            exchangeRates: new Map(),
            loading: false,
            apiStatus: 'ready',
            converters: [
                { currency: 'USD', amount: '', lastModified: null },
                { currency: 'EUR', amount: '', lastModified: null },
                { currency: 'GBP', amount: '', lastModified: null }
            ]
        };

        this.debounceTimers = new Map();
        this.initializeDefaultCurrencies();
        this.init();
    }

    initializeDefaultCurrencies() {
        // Initialize with comprehensive currency list immediately
        const currencies = new Map([
            ['USD', 'United States Dollar'],
            ['EUR', 'Euro'],
            ['GBP', 'British Pound Sterling'],
            ['JPY', 'Japanese Yen'],
            ['AUD', 'Australian Dollar'],
            ['CAD', 'Canadian Dollar'],
            ['CHF', 'Swiss Franc'],
            ['CNY', 'Chinese Yuan'],
            ['SEK', 'Swedish Krona'],
            ['NZD', 'New Zealand Dollar'],
            ['MXN', 'Mexican Peso'],
            ['SGD', 'Singapore Dollar'],
            ['HKD', 'Hong Kong Dollar'],
            ['NOK', 'Norwegian Krone'],
            ['KRW', 'South Korean Won'],
            ['TRY', 'Turkish Lira'],
            ['RUB', 'Russian Ruble'],
            ['INR', 'Indian Rupee'],
            ['BRL', 'Brazilian Real'],
            ['ZAR', 'South African Rand'],
            ['PLN', 'Polish Zloty'],
            ['THB', 'Thai Baht'],
            ['IDR', 'Indonesian Rupiah'],
            ['HUF', 'Hungarian Forint'],
            ['CZK', 'Czech Koruna'],
            ['ILS', 'Israeli New Shekel'],
            ['CLP', 'Chilean Peso'],
            ['PHP', 'Philippine Peso'],
            ['AED', 'UAE Dirham'],
            ['COP', 'Colombian Peso'],
            ['SAR', 'Saudi Riyal'],
            ['MYR', 'Malaysian Ringgit'],
            ['RON', 'Romanian Leu'],
            ['BGN', 'Bulgarian Lev'],
            ['HRK', 'Croatian Kuna'],
            ['RSD', 'Serbian Dinar'],
            ['QAR', 'Qatari Riyal'],
            ['BHD', 'Bahraini Dinar'],
            ['KWD', 'Kuwaiti Dinar'],
            ['OMR', 'Omani Rial'],
            ['JOD', 'Jordanian Dinar'],
            ['TND', 'Tunisian Dinar'],
            ['EGP', 'Egyptian Pound'],
            ['MAD', 'Moroccan Dirham'],
            ['DZD', 'Algerian Dinar'],
            ['LBP', 'Lebanese Pound'],
            ['KZT', 'Kazakhstani Tenge'],
            ['UAH', 'Ukrainian Hryvnia'],
            ['BYN', 'Belarusian Ruble'],
            ['GEL', 'Georgian Lari'],
            ['AMD', 'Armenian Dram'],
            ['AZN', 'Azerbaijani Manat'],
            ['UZS', 'Uzbekistani Som'],
            ['KGS', 'Kyrgyzstani Som'],
            ['TJS', 'Tajikistani Somoni'],
            ['TMT', 'Turkmenistani Manat'],
            ['AFN', 'Afghan Afghani'],
            ['ALL', 'Albanian Lek'],
            ['DZD', 'Algerian Dinar'],
            ['AOA', 'Angolan Kwanza'],
            ['ARS', 'Argentine Peso'],
            ['AWG', 'Aruban Florin'],
            ['BSD', 'Bahamian Dollar'],
            ['BDT', 'Bangladeshi Taka'],
            ['BBD', 'Barbadian Dollar'],
            ['BZD', 'Belize Dollar'],
            ['BMD', 'Bermudan Dollar'],
            ['BTN', 'Bhutanese Ngultrum'],
            ['BOB', 'Bolivian Boliviano'],
            ['BAM', 'Bosnia-Herzegovina Convertible Mark'],
            ['BWP', 'Botswanan Pula'],
            ['BND', 'Brunei Dollar'],
            ['BIF', 'Burundian Franc'],
            ['KHR', 'Cambodian Riel'],
            ['CVE', 'Cape Verdean Escudo'],
            ['KYD', 'Cayman Islands Dollar'],
            ['XAF', 'Central African CFA Franc'],
            ['XPF', 'CFP Franc'],
            ['CDF', 'Congolese Franc'],
            ['CRC', 'Costa Rican Colón'],
            ['CUP', 'Cuban Peso'],
            ['DJF', 'Djiboutian Franc'],
            ['DOP', 'Dominican Peso'],
            ['XCD', 'East Caribbean Dollar'],
            ['ERN', 'Eritrean Nakfa'],
            ['SZL', 'Eswatini Lilangeni'],
            ['ETB', 'Ethiopian Birr'],
            ['FKP', 'Falkland Islands Pound'],
            ['FJD', 'Fijian Dollar'],
            ['GMD', 'Gambian Dalasi'],
            ['GHS', 'Ghanaian Cedi'],
            ['GIP', 'Gibraltar Pound'],
            ['GTQ', 'Guatemalan Quetzal'],
            ['GGP', 'Guernsey Pound'],
            ['GNF', 'Guinean Franc'],
            ['GYD', 'Guyanaese Dollar'],
            ['HTG', 'Haitian Gourde'],
            ['HNL', 'Honduran Lempira'],
            ['ISK', 'Icelandic Krona'],
            ['IRR', 'Iranian Rial'],
            ['IQD', 'Iraqi Dinar'],
            ['IMP', 'Isle of Man Pound'],
            ['JMD', 'Jamaican Dollar'],
            ['JEP', 'Jersey Pound'],
            ['KES', 'Kenyan Shilling'],
            ['KPW', 'North Korean Won'],
            ['LAK', 'Laotian Kip'],
            ['LRD', 'Liberian Dollar'],
            ['LYD', 'Libyan Dinar'],
            ['MOP', 'Macanese Pataca'],
            ['MKD', 'Macedonian Denar'],
            ['MGA', 'Malagasy Ariary'],
            ['MWK', 'Malawian Kwacha'],
            ['MVR', 'Maldivian Rufiyaa'],
            ['MRU', 'Mauritanian Ouguiya'],
            ['MUR', 'Mauritian Rupee'],
            ['MDL', 'Moldovan Leu'],
            ['MNT', 'Mongolian Tugrik'],
            ['MZN', 'Mozambican Metical'],
            ['MMK', 'Myanmar Kyat'],
            ['NAD', 'Namibian Dollar'],
            ['NPR', 'Nepalese Rupee'],
            ['ANG', 'Netherlands Antillean Guilder'],
            ['NIO', 'Nicaraguan Córdoba'],
            ['NGN', 'Nigerian Naira'],
            ['PKR', 'Pakistani Rupee'],
            ['PAB', 'Panamanian Balboa'],
            ['PGK', 'Papua New Guinean Kina'],
            ['PYG', 'Paraguayan Guarani'],
            ['PEN', 'Peruvian Nuevo Sol'],
            ['QAR', 'Qatari Rial'],
            ['RWF', 'Rwandan Franc'],
            ['SHP', 'Saint Helena Pound'],
            ['WST', 'Samoan Tala'],
            ['STN', 'São Tomé and Príncipe Dobra'],
            ['SCR', 'Seychellois Rupee'],
            ['SLL', 'Sierra Leonean Leone'],
            ['SBD', 'Solomon Islands Dollar'],
            ['SOS', 'Somali Shilling'],
            ['LKR', 'Sri Lankan Rupee'],
            ['SDG', 'Sudanese Pound'],
            ['SRD', 'Surinamese Dollar'],
            ['SYP', 'Syrian Pound'],
            ['TWD', 'Taiwan New Dollar'],
            ['TZS', 'Tanzanian Shilling'],
            ['TOP', 'Tongan Paʻanga'],
            ['TTD', 'Trinidad and Tobago Dollar'],
            ['UGX', 'Ugandan Shilling'],
            ['UYU', 'Uruguayan Peso'],
            ['VUV', 'Vanuatu Vatu'],
            ['VES', 'Venezuelan Bolívar'],
            ['VND', 'Vietnamese Dong'],
            ['YER', 'Yemeni Rial'],
            ['ZMW', 'Zambian Kwacha'],
            ['ZWL', 'Zimbabwean Dollar'],
            ['BTC', 'Bitcoin'],
            ['ETH', 'Ethereum'],
            ['XAU', 'Gold Ounce'],
            ['XAG', 'Silver Ounce'],
            ['XPT', 'Platinum Ounce'],
            ['XPD', 'Palladium Ounce']
        ]);

        this.state.currencies = currencies;
    }

    async init() {
        try {
            this.setupEventListeners();
            this.loadUserPreferences();
            this.populateDropdowns();
            this.updateApiStatus('ready');
            
            // Try to load more currencies in background
            this.loadAdditionalCurrencies();
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showError('Application initialized with limited functionality.');
        }
    }

    async loadAdditionalCurrencies() {
        try {
            const response = await this.fetchWithFallback('usd.json');
            const data = await response.json();
            
            if (data && data.usd) {
                Object.keys(data.usd).forEach(code => {
                    const upperCode = code.toUpperCase();
                    if (!this.state.currencies.has(upperCode)) {
                        this.state.currencies.set(upperCode, this.getCurrencyName(upperCode));
                    }
                });
                
                // Refresh dropdowns with new currencies
                this.populateDropdowns();
                console.log(`Total currencies loaded: ${this.state.currencies.size}`);
            }
        } catch (error) {
            console.warn('Failed to load additional currencies:', error);
        }
    }

    setupEventListeners() {
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.resetToDefaults());

        // Currency and amount inputs for each converter
        for (let i = 0; i < 3; i++) {
            const currencySelect = document.getElementById(`currency-${i}`);
            const amountInput = document.getElementById(`amount-${i}`);

            currencySelect.addEventListener('change', (e) => this.handleCurrencyChange(i, e.target.value));
            amountInput.addEventListener('input', (e) => this.handleAmountInput(i, e.target.value));
            amountInput.addEventListener('focus', () => this.setLastModified(i));
        }
    }

    getCurrencyName(code) {
        // Enhanced currency name mapping
        const currencyNames = {
            'USD': 'United States Dollar',
            'EUR': 'Euro',
            'GBP': 'British Pound Sterling',
            'JPY': 'Japanese Yen',
            'AUD': 'Australian Dollar',
            'CAD': 'Canadian Dollar',
            'CHF': 'Swiss Franc',
            'CNY': 'Chinese Yuan',
            'INR': 'Indian Rupee',
            'BRL': 'Brazilian Real',
            'RUB': 'Russian Ruble',
            'KRW': 'South Korean Won',
            'MXN': 'Mexican Peso',
            'ZAR': 'South African Rand',
            'SGD': 'Singapore Dollar',
            'HKD': 'Hong Kong Dollar',
            'NOK': 'Norwegian Krone',
            'SEK': 'Swedish Krona',
            'TRY': 'Turkish Lira',
            'PLN': 'Polish Zloty',
            'THB': 'Thai Baht',
            'IDR': 'Indonesian Rupiah',
            'NZD': 'New Zealand Dollar',
            'ILS': 'Israeli New Shekel',
            'AED': 'UAE Dirham',
            'SAR': 'Saudi Riyal',
            'MYR': 'Malaysian Ringgit'
        };

        return currencyNames[code] || `${code} Currency`;
    }

    populateDropdowns() {
        const sortedCurrencies = Array.from(this.state.currencies.entries())
            .sort((a, b) => a[1].localeCompare(b[1]));

        for (let i = 0; i < 3; i++) {
            const select = document.getElementById(`currency-${i}`);
            const currentValue = select.value || this.state.converters[i].currency;
            
            select.innerHTML = '';

            sortedCurrencies.forEach(([code, name]) => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = `${code} - ${name}`;
                option.selected = code === currentValue;
                select.appendChild(option);
            });

            // Update the state to match the selected value
            this.state.converters[i].currency = currentValue;
            this.updateCurrencyInfo(i);
        }
    }

    async fetchWithFallback(endpoint) {
        const urls = [
            this.config.primaryAPI + endpoint,
            this.config.fallbackAPI + endpoint
        ];

        for (const url of urls) {
            try {
                const response = await fetch(url);
                if (response.ok) {
                    return response;
                }
            } catch (error) {
                console.warn(`Failed to fetch from ${url}:`, error);
            }
        }
        
        throw new Error('All API endpoints failed');
    }

    async loadExchangeRates(baseCurrency) {
        // Check cache first
        if (this.state.exchangeRates.has(baseCurrency)) {
            const cached = this.state.exchangeRates.get(baseCurrency);
            if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
                return cached.rates;
            }
        }

        try {
            const response = await this.fetchWithFallback(`${baseCurrency.toLowerCase()}.json`);
            const data = await response.json();
            
            if (data && data[baseCurrency.toLowerCase()]) {
                const rates = data[baseCurrency.toLowerCase()];
                this.state.exchangeRates.set(baseCurrency, {
                    rates,
                    timestamp: Date.now()
                });
                return rates;
            } else {
                throw new Error('Invalid exchange rate data');
            }
        } catch (error) {
            console.error(`Failed to load exchange rates for ${baseCurrency}:`, error);
            
            // Return fallback rates for major currencies
            return this.getFallbackRates(baseCurrency);
        }
    }

    getFallbackRates(baseCurrency) {
        // Static fallback rates (approximate) for major currencies
        const fallbackRates = {
            'USD': { 'eur': 0.85, 'gbp': 0.73, 'jpy': 110, 'cad': 1.25, 'aud': 1.35 },
            'EUR': { 'usd': 1.18, 'gbp': 0.86, 'jpy': 130, 'cad': 1.47, 'aud': 1.59 },
            'GBP': { 'usd': 1.37, 'eur': 1.16, 'jpy': 151, 'cad': 1.71, 'aud': 1.85 }
        };

        return fallbackRates[baseCurrency] || {};
    }

    handleCurrencyChange(converterIndex, newCurrency) {
        this.state.converters[converterIndex].currency = newCurrency;
        this.saveUserPreferences();
        this.updateCurrencyInfo(converterIndex);
        
        if (this.state.converters[converterIndex].amount) {
            this.performConversion(converterIndex);
        }
    }

    handleAmountInput(converterIndex, value) {
        const sanitizedValue = this.sanitizeNumericInput(value);
        const input = document.getElementById(`amount-${converterIndex}`);
        
        if (sanitizedValue !== value) {
            input.value = sanitizedValue;
        }

        this.state.converters[converterIndex].amount = sanitizedValue;
        this.setLastModified(converterIndex);

        // Clear existing debounce timer
        if (this.debounceTimers.has(converterIndex)) {
            clearTimeout(this.debounceTimers.get(converterIndex));
        }

        // Set new debounce timer
        const timer = setTimeout(() => {
            if (sanitizedValue) {
                this.performConversion(converterIndex);
            } else {
                this.clearOtherAmounts(converterIndex);
            }
        }, this.config.debounceDelay);

        this.debounceTimers.set(converterIndex, timer);
    }

    sanitizeNumericInput(value) {
        // Allow digits, decimal point, commas, and negative sign
        let sanitized = value.replace(/[^0-9.,-]/g, '');
        
        // Remove commas for processing
        sanitized = sanitized.replace(/,/g, '');
        
        // Ensure only one decimal point
        const parts = sanitized.split('.');
        if (parts.length > 2) {
            sanitized = parts[0] + '.' + parts.slice(1).join('');
        }

        // Handle negative sign
        const negativeCount = (sanitized.match(/-/g) || []).length;
        if (negativeCount > 1) {
            sanitized = sanitized.charAt(0) === '-' ? '-' + sanitized.replace(/-/g, '') : sanitized.replace(/-/g, '');
        } else if (negativeCount === 1 && sanitized.charAt(0) !== '-') {
            sanitized = sanitized.replace(/-/g, '');
        }

        return sanitized;
    }

    setLastModified(converterIndex) {
        this.state.converters[converterIndex].lastModified = Date.now();
    }

    async performConversion(sourceIndex) {
        const sourceConverter = this.state.converters[sourceIndex];
        const sourceCurrency = sourceConverter.currency;
        const sourceAmount = sourceConverter.amount;

        if (!sourceCurrency || !sourceAmount) return;

        try {
            // Validate amount using Decimal.js for high precision
            const decimal = new Decimal(sourceAmount);
            if (!decimal.isFinite()) return;

            this.setConverterStatus(sourceIndex, 'loading');
            
            const rates = await this.loadExchangeRates(sourceCurrency);
            
            // Convert to other currencies
            for (let i = 0; i < 3; i++) {
                if (i === sourceIndex) continue;

                const targetCurrency = this.state.converters[i].currency;
                if (!targetCurrency) continue;

                const rate = rates[targetCurrency.toLowerCase()];
                if (rate) {
                    const convertedAmount = decimal.mul(new Decimal(rate));
                    const precision = this.config.precision[targetCurrency] || 2;
                    const formattedAmount = this.formatNumber(convertedAmount, precision);
                    
                    // Only update if this converter wasn't recently modified by user
                    const lastModified = this.state.converters[i].lastModified;
                    if (!lastModified || Date.now() - lastModified > 2000) {
                        document.getElementById(`amount-${i}`).value = formattedAmount;
                        this.state.converters[i].amount = formattedAmount;
                    }
                    
                    this.setConverterStatus(i, 'active');
                } else {
                    this.setConverterStatus(i, 'error');
                }
            }

            this.setConverterStatus(sourceIndex, 'active');
            this.updateApiStatus('active');

        } catch (error) {
            console.error('Conversion failed:', error);
            this.setConverterStatus(sourceIndex, 'error');
            this.showError('Conversion failed. Please check your input and try again.');
        }
    }

    formatNumber(decimal, precision) {
        try {
            const rounded = decimal.toDecimalPlaces(precision);
            const number = parseFloat(rounded.toString());
            
            if (precision === 0) {
                return Math.round(number).toLocaleString();
            } else {
                return number.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: precision
                });
            }
        } catch (error) {
            console.error('Number formatting error:', error);
            return decimal.toString();
        }
    }

    clearOtherAmounts(sourceIndex) {
        for (let i = 0; i < 3; i++) {
            if (i !== sourceIndex) {
                document.getElementById(`amount-${i}`).value = '';
                this.state.converters[i].amount = '';
                this.setConverterStatus(i, '');
            }
        }
    }

    setConverterStatus(index, status) {
        const statusElement = document.getElementById(`status-${index}`);
        statusElement.className = `status-indicator ${status}`;
    }

    updateCurrencyInfo(index) {
        const currency = this.state.converters[index].currency;
        const infoElement = document.getElementById(`info-${index}`);
        
        if (currency && this.state.currencies.has(currency)) {
            const precision = this.config.precision[currency] || 2;
            const currencyName = this.state.currencies.get(currency);
            infoElement.textContent = `${currencyName} (${precision} decimal places)`;
            infoElement.className = 'currency-info has-rate';
        } else {
            infoElement.textContent = '';
            infoElement.className = 'currency-info';
        }
    }

    updateApiStatus(status) {
        const statusElement = document.getElementById('apiStatus');
        const statusMap = {
            'ready': { class: 'status--info', text: `${this.state.currencies.size} Currencies Ready` },
            'active': { class: 'status--success', text: 'Converting' },
            'limited': { class: 'status--warning', text: 'Limited Mode' },
            'error': { class: 'status--error', text: 'API Error' }
        };

        const config = statusMap[status] || statusMap.ready;
        statusElement.innerHTML = `<span class="status ${config.class}">${config.text}</span>`;
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loadingIndicator');
        if (show) {
            loadingElement.classList.remove('hidden');
        } else {
            loadingElement.classList.add('hidden');
        }
    }

    resetToDefaults() {
        // Clear all debounce timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();

        this.state.converters = [
            { currency: 'USD', amount: '', lastModified: null },
            { currency: 'EUR', amount: '', lastModified: null },
            { currency: 'GBP', amount: '', lastModified: null }
        ];

        for (let i = 0; i < 3; i++) {
            document.getElementById(`currency-${i}`).value = this.config.defaultCurrencies[i];
            document.getElementById(`amount-${i}`).value = '';
            this.state.converters[i].currency = this.config.defaultCurrencies[i];
            this.setConverterStatus(i, '');
            this.updateCurrencyInfo(i);
        }

        this.saveUserPreferences();
    }

    saveUserPreferences() {
        try {
            const preferences = {
                currencies: this.state.converters.map(c => c.currency),
                timestamp: Date.now()
            };
            sessionStorage.setItem('currencyConverterPrefs', JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save preferences:', error);
        }
    }

    loadUserPreferences() {
        try {
            const saved = sessionStorage.getItem('currencyConverterPrefs');
            if (saved) {
                const preferences = JSON.parse(saved);
                if (preferences.currencies && preferences.currencies.length === 3) {
                    preferences.currencies.forEach((currency, index) => {
                        if (this.state.currencies.has(currency)) {
                            this.state.converters[index].currency = currency;
                        }
                    });
                }
            }
        } catch (error) {
            console.warn('Failed to load preferences:', error);
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.currencyConverter = new CurrencyConverter();
});