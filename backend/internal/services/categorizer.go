package services

import "strings"

type Categorizer struct {
	rules []categoryRule
}

type categoryRule struct {
	keywords []string
	category string
}

func NewCategorizer() *Categorizer {
	return &Categorizer{
		rules: []categoryRule{
			{
				keywords: []string{"netflix", "spotify", "hbo", "disney", "hulu", "youtube premium", "apple tv", "amazon prime", "paramount", "peacock", "crunchyroll", "dazn", "tidal", "apple music", "deezer"},
				category: "Streaming",
			},
			{
				keywords: []string{"uber eats", "doordash", "grubhub", "deliveroo", "just eat", "wolt", "foodora", "instacart", "seamless"},
				category: "Food Delivery",
			},
			{
				keywords: []string{"restaurant", "cafe", "coffee", "starbucks", "mcdonald", "burger", "pizza", "sushi", "kebab", "bistro", "grill", "tavern", "diner"},
				category: "Dining",
			},
			{
				keywords: []string{"uber", "lyft", "taxi", "bolt", "cabify", "grab"},
				category: "Transport",
			},
			{
				keywords: []string{"gas", "shell", "bp ", "exxon", "chevron", "texaco", "petrol", "fuel", "parking"},
				category: "Fuel & Parking",
			},
			{
				keywords: []string{"amazon", "ebay", "etsy", "aliexpress", "shopify", "zalando", "asos", "h&m", "zara", "ikea", "walmart", "target", "costco"},
				category: "Shopping",
			},
			{
				keywords: []string{"gym", "fitness", "yoga", "crossfit", "peloton", "nike", "adidas"},
				category: "Fitness",
			},
			{
				keywords: []string{"pharmacy", "doctor", "hospital", "clinic", "dental", "health", "cvs", "walgreens"},
				category: "Health",
			},
			{
				keywords: []string{"electric", "electricity", "water", "gas bill", "internet", "broadband", "comcast", "verizon", "at&t", "t-mobile", "phone", "mobile plan"},
				category: "Utilities",
			},
			{
				keywords: []string{"steam", "playstation", "xbox", "nintendo", "epic games", "gog", "twitch", "gaming"},
				category: "Gaming",
			},
			{
				keywords: []string{"github", "aws", "google cloud", "azure", "digitalocean", "heroku", "cloudflare", "notion", "slack", "zoom", "microsoft 365", "office 365", "adobe", "figma", "dropbox", "google one", "icloud"},
				category: "Software & Tools",
			},
			{
				keywords: []string{"insurance", "geico", "progressive", "allstate", "state farm"},
				category: "Insurance",
			},
			{
				keywords: []string{"airbnb", "hotel", "booking", "expedia", "hilton", "marriott", "flight", "airline", "delta", "united", "american airlines", "ryanair", "easyjet"},
				category: "Travel",
			},
			{
				keywords: []string{"loan", "mortgage", "interest", "bank fee", "atm", "wire transfer"},
				category: "Finance",
			},
			{
				keywords: []string{"supermarket", "grocery", "whole foods", "trader joe", "kroger", "aldi", "lidl", "safeway", "publix"},
				category: "Groceries",
			},
		},
	}
}

func (c *Categorizer) Categorize(description string) string {
	lower := strings.ToLower(description)
	for _, rule := range c.rules {
		for _, kw := range rule.keywords {
			if strings.Contains(lower, kw) {
				return rule.category
			}
		}
	}
	return "Other"
}
