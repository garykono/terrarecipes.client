// Term-to-facetId synonym map
export const TERM_TO_ID = new Map<string, string>([
    // Diet
    ["vegan", "diet-vegan"],
    ["vegetarian", "diet-vegetarian"],
    ["gluten free", "diet-gluten-free"],
    ["gluten-free", "diet-gluten-free"],
    ["keto", "diet-keto"],
    ["paleo", "diet-paleo"],
    ["dairy free", "diet-dairy-free"],
    ["dairy-free", "diet-dairy-free"],
    ["low carb", "diet-low-carb"],
    ["low-carb", "diet-low-carb"],

    // Meals
    ["breakfast", "meal-breakfast"],
    ["lunch", "meal-lunch"],
    ["dinner", "meal-dinner"],
    ["snack", "meal-snack"],

    // Course
    ["appetizer", "course-appetizer"],
    ["main", "course-main"],
    ["main dish", "course-main"],
    ["side", "course-side"],
    ["dessert", "course-dessert"],

    // Dish type
    ["soup", "dishType-soup"],
    ["salad", "dishType-salad"],
    ["pasta", "dishType-pasta"],
    ["bowl", "dishType-bowl"],
    ["one pot", "dishType-one-pot"],
    ["one-pot", "dishType-one-pot"],
    ["sheet pan", "dishType-sheet-pan"],
    ["sheet-pan", "dishType-sheet-pan"],

    // Methods
    ["grilled", "method-grilled"],
    ["roasted", "method-roasted"],
    ["baked", "method-baked"],
    ["stir fried", "method-stir-fried"],
    ["stir-fried", "method-stir-fried"],
    ["fried", "method-fried"],
    ["slow cooked", "method-slow-cooked"],
    ["slow-cooked", "method-slow-cooked"],
    ["instant pot", "appliance-instant-pot"],

    // Appliances
    ["air fryer", "appliance-air-fryer"],
    ["slow cooker", "appliance-slow-cooker"],
    ["instant pot", "appliance-instant-pot"],

    // Flavors
    ["sweet", "flavor-sweet"],
    ["savory", "flavor-savory"],
    ["spicy", "flavor-spicy"],
    ["tangy", "flavor-tangy"],

    // Seasons
    ["summer", "season-summer"],
    ["fall", "season-fall"],
    ["autumn", "season-fall"],
    ["winter", "season-winter"],
    ["spring", "season-spring"],

    // Occasions
    ["holiday", "occasion-holiday"],
    ["christmas", "occasion-christmas"],
    ["thanksgiving", "occasion-thanksgiving"],
    ["birthday", "occasion-birthday"],
    ["game day", "occasion-game-day"],
]);