import { useState } from "react";
import { 
  Refrigerator, 
  ChefHat, 
  ShoppingCart, 
  Settings, 
  Camera, 
  Filter,
  X,
  ChevronRight,
  Clock,
  Flame,
  Volume2,
  CheckCircle2,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { analyzeFridge, generateRecipes, Recipe, speakText } from "@/src/services/gemini";

// --- Types ---
type View = "fridge" | "recipes" | "shopping";

export default function App() {
  const [view, setView] = useState<View>("fridge");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const dietaryOptions = ["Vegetarian", "Keto", "Vegan", "Gluten-Free", "Low-Carb", "Paleo"];

  const toggleFilter = (filter: string) => {
    setDietaryFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const foundIngredients = await analyzeFridge(base64);
        setIngredients(foundIngredients);
        const suggestedRecipes = await generateRecipes(foundIngredients, dietaryFilters);
        setRecipes(suggestedRecipes);
        setView("recipes");
      } catch (error) {
        console.error("Scan failed", error);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addToShoppingList = (item: string) => {
    if (!shoppingList.includes(item)) {
      setShoppingList([...shoppingList, item]);
    }
  };

  const removeFromShoppingList = (item: string) => {
    setShoppingList(shoppingList.filter(i => i !== item));
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-neutral-200 flex-shrink-0 flex flex-col"
      >
        <div className="p-6 border-b border-neutral-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <ChefHat size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">Culinary AI</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <section>
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Filter size={14} /> Dietary Filters
            </h3>
            <div className="space-y-2">
              {dietaryOptions.map(option => (
                <button
                  key={option}
                  onClick={() => toggleFilter(option)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group",
                    dietaryFilters.includes(option) 
                      ? "bg-emerald-50 text-emerald-700 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}
                >
                  {option}
                  {dietaryFilters.includes(option) && <CheckCircle2 size={16} className="text-emerald-600" />}
                </button>
              ))}
            </div>
          </section>

          {ingredients.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-4">
                In Your Fridge
              </h3>
              <div className="flex flex-wrap gap-2">
                {ingredients.map(ing => (
                  <span key={ing} className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-md border border-neutral-200">
                    {ing}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="p-6 border-t border-neutral-100 space-y-2">
          <button 
            onClick={() => setView("shopping")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              view === "shopping" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-neutral-600 hover:bg-neutral-100"
            )}
          >
            <ShoppingCart size={18} />
            Shopping List
            {shoppingList.length > 0 && (
              <span className="ml-auto bg-emerald-400/20 text-emerald-600 px-2 py-0.5 rounded-full text-[10px]">
                {shoppingList.length}
              </span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-neutral-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500"
            >
              <Filter size={20} />
            </button>
            <nav className="flex items-center gap-6">
              <button 
                onClick={() => setView("fridge")}
                className={cn("text-sm font-medium transition-colors", view === "fridge" ? "text-emerald-600" : "text-neutral-500 hover:text-neutral-900")}
              >
                Scan Fridge
              </button>
              <button 
                onClick={() => setView("recipes")}
                className={cn("text-sm font-medium transition-colors", view === "recipes" ? "text-emerald-600" : "text-neutral-500 hover:text-neutral-900")}
              >
                Recipes
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {view === "fridge" && (
              <motion.div
                key="fridge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-3xl mx-auto text-center py-20"
              >
                <div className="mb-8 inline-flex p-6 bg-emerald-50 rounded-3xl text-emerald-600 border-2 border-emerald-100">
                  <Refrigerator size={64} strokeWidth={1.5} />
                </div>
                <h2 className="text-4xl font-bold mb-4 tracking-tight">What's in your fridge?</h2>
                <p className="text-neutral-500 mb-12 text-lg max-w-md mx-auto">
                  Snap a photo and our AI will identify your ingredients to suggest the perfect meal.
                </p>
                
                <label className="relative group cursor-pointer inline-block">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="hidden" 
                    disabled={isScanning}
                  />
                  <div className={cn(
                    "flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-semibold shadow-xl shadow-emerald-200 transition-all duration-300 group-hover:scale-105 group-active:scale-95",
                    isScanning && "opacity-70 cursor-not-allowed"
                  )}>
                    {isScanning ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      >
                        <ChefHat size={24} />
                      </motion.div>
                    ) : (
                      <Camera size={24} />
                    )}
                    {isScanning ? "Analyzing Ingredients..." : "Snap Fridge Photo"}
                  </div>
                </label>
              </motion.div>
            )}

            {view === "recipes" && (
              <motion.div
                key="recipes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {recipes.length === 0 ? (
                  <div className="col-span-full text-center py-20">
                    <p className="text-neutral-400">Scan your fridge to see suggested recipes!</p>
                  </div>
                ) : (
                  recipes.map(recipe => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      onClick={() => setSelectedRecipe(recipe)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {view === "shopping" && (
              <motion.div
                key="shopping"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Shopping List</h2>
                  <span className="text-sm text-neutral-500">{shoppingList.length} items</span>
                </div>
                {shoppingList.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-neutral-200">
                    <ShoppingCart size={48} className="mx-auto text-neutral-200 mb-4" />
                    <p className="text-neutral-400">Your shopping list is empty</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-sm">
                    {shoppingList.map(item => (
                      <div key={item} className="flex items-center justify-between p-5 group">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-neutral-200 rounded-md group-hover:border-emerald-500 transition-colors" />
                          <span className="font-medium">{item}</span>
                        </div>
                        <button 
                          onClick={() => removeFromShoppingList(item)}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Recipe Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <RecipeModal 
            recipe={selectedRecipe} 
            onClose={() => setSelectedRecipe(null)}
            onAddToShopping={addToShoppingList}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function RecipeCard({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white rounded-3xl border border-neutral-200 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 flex flex-col"
    >
      <div className="h-48 bg-emerald-50 flex items-center justify-center relative group overflow-hidden">
        <ChefHat size={48} className="text-emerald-200 group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-4 left-4 flex gap-2">
          {recipe.dietaryTags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
            recipe.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" :
            recipe.difficulty === "Medium" ? "bg-amber-100 text-amber-700" :
            "bg-rose-100 text-rose-700"
          )}>
            {recipe.difficulty}
          </span>
          <div className="flex items-center gap-3 text-neutral-400 text-xs">
            <span className="flex items-center gap-1"><Clock size={12} /> {recipe.prepTime}</span>
            <span className="flex items-center gap-1"><Flame size={12} /> {recipe.calories} kcal</span>
          </div>
        </div>
        <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-600 transition-colors">{recipe.title}</h3>
        <p className="text-neutral-500 text-sm line-clamp-2 mb-4 flex-1">{recipe.description}</p>
        <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
          <span className="text-xs text-neutral-400">
            {recipe.ingredients.filter(i => !i.isMissing).length}/{recipe.ingredients.length} ingredients
          </span>
          <ChevronRight size={18} className="text-emerald-600" />
        </div>
      </div>
    </motion.div>
  );
}

function RecipeModal({ recipe, onClose, onAddToShopping }: { recipe: Recipe; onClose: () => void; onAddToShopping: (item: string) => void }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    const audioUrl = await speakText(text);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } else {
      setIsSpeaking(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-neutral-900/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side: Info & Ingredients */}
        <div className="w-full md:w-2/5 border-r border-neutral-100 overflow-y-auto p-8 md:p-12">
          <button 
            onClick={onClose}
            className="mb-8 p-2 hover:bg-neutral-100 rounded-full text-neutral-400 transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">{recipe.title}</h2>
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full text-sm font-medium text-neutral-600">
                <Clock size={16} /> {recipe.prepTime}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full text-sm font-medium text-neutral-600">
                <Flame size={16} /> {recipe.calories} kcal
              </span>
            </div>
            <p className="text-neutral-500 leading-relaxed">{recipe.description}</p>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold text-lg">Ingredients</h3>
            <div className="space-y-3">
              {recipe.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      ing.isMissing ? "bg-rose-400" : "bg-emerald-400"
                    )} />
                    <span className={cn("text-sm", ing.isMissing && "text-neutral-400 line-through")}>
                      {ing.amount} {ing.name}
                    </span>
                  </div>
                  {ing.isMissing && (
                    <button 
                      onClick={() => onAddToShopping(ing.name)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-emerald-50 text-emerald-600 rounded-lg transition-all"
                      title="Add to shopping list"
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Step by Step */}
        <div className="flex-1 bg-neutral-50 overflow-y-auto p-8 md:p-12">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-bold text-2xl">Cooking Steps</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Live Mode
            </div>
          </div>

          <div className="space-y-6">
            {recipe.steps.map((step, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 4 }}
                onClick={() => setActiveStep(idx)}
                className={cn(
                  "p-8 rounded-3xl border-2 transition-all duration-300 cursor-pointer relative group",
                  activeStep === idx 
                    ? "bg-white border-emerald-500 shadow-xl shadow-emerald-900/5" 
                    : "bg-white/50 border-transparent hover:border-neutral-200"
                )}
              >
                <div className="flex gap-6">
                  <span className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 transition-colors",
                    activeStep === idx ? "bg-emerald-600 text-white" : "bg-neutral-200 text-neutral-500"
                  )}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className={cn(
                      "text-xl leading-relaxed transition-colors",
                      activeStep === idx ? "text-neutral-900 font-medium" : "text-neutral-500"
                    )}>
                      {step}
                    </p>
                    {activeStep === idx && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex items-center gap-4"
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSpeak(step);
                          }}
                          disabled={isSpeaking}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          <Volume2 size={18} />
                          {isSpeaking ? "Speaking..." : "Read Aloud"}
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
