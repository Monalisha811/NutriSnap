import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Droplets,
  Drumstick,
  Flame,
  Sparkles,
  Upload,
  Wheat,
  X,
} from 'lucide-react';

import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const demoFoods = [
  { name: 'Rice', confidence: 0.96 },
  { name: 'Chicken Curry', confidence: 0.91 },
  { name: 'Salad', confidence: 0.87 },
  { name: 'Papad', confidence: 0.81 },
];

const fmt = (n) => Math.round(n || 0);

function App() {
  const fileInput = useRef();

  const [screen, setScreen] = useState('home');
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [foods, setFoods] = useState([]);
  // Backup option when AI confidence is very low
  const [showFoodPicker, setShowFoodPicker] = useState(false);

  const [context, setContext] = useState({
    source: 'homemade',
    method: 'grilled',
    oil: 'olive',
    portion: 'medium',
  });

  const [nutrition, setNutrition] = useState(null);
  const [healthySuggestion, setHealthySuggestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [history, setHistory] = useState([]);

  /*
   * Determine whether this food actually needs
   * cooking-related questions.
   *
   * Examples:
   * Raw      -> no cooking questions
   * Fresh    -> no cooking questions
   * Chilled  -> no cooking questions
   * Frozen   -> no cooking questions
   *
   * Cooked foods -> show cooking questions
   */
  const cookingMethod = nutrition?.cooking_method || '';

  const isNoCookingFood =
    cookingMethod === 'Raw' ||
    cookingMethod === 'Fresh' ||
    cookingMethod === 'Chilled' ||
    cookingMethod === 'Frozen';

  /*
   * If nutrition has not arrived yet, keep the
   * cooking questions visible.
   */
  const needsCookingDetails =
    nutrition ? !isNoCookingFood : true;

  // ---------------------------------------
  // IMAGE UPLOAD + BACKEND ANALYSIS
  // ---------------------------------------

  const onFile = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setSelectedFile(file);
    setLoading(true);

    try {
      const body = new FormData();
      body.append('image', file);

      const res = await fetch(`${API}/meals/analyze`, {
        method: 'POST',
        body,
      });

      const data = await res.json();

      console.log('Backend response:', data);

      if (!res.ok) {
        throw new Error(
          data.error || 'Image analysis failed'
        );
      }

      // Food detections
      setFoods(data.detections || demoFoods);

      // Nutrition returned by backend
      setNutrition(data.nutrition || null);

      // Healthy suggestion
      setHealthySuggestion(
        data.healthy_suggestion || ''
      );

      /*
       * If AI confidence is below 10%,
       * consider the detection unreliable.
       */
      const lowConfidence =
        data.detections?.some(
          (food) => food.confidence < 0.10
        ) || false;

      setShowFoodPicker(lowConfidence);
    } catch (err) {
      console.error('Gemini Error:', err);

      alert(
        err.message ||
          'Something went wrong while analyzing the image.'
      );

      setFoods(demoFoods);
      setShowFoodPicker(false);
    } finally {
      setLoading(false);
      setScreen('review');
    }
  };

  // ---------------------------------------
  // DEMO SCAN
  // ---------------------------------------

  const analyze = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API}/meals/analyze`,
        {
          method: 'POST',
        }
      );

      const data = await res.json();

      setFoods(data.detections || demoFoods);
      setNutrition(data.nutrition || null);

      const lowConfidence =
        data.detections?.some(
          (food) => food.confidence < 0.10
        ) || false;

      setShowFoodPicker(lowConfidence);
    } catch {
      setFoods(demoFoods);
      setShowFoodPicker(false);
    } finally {
      setLoading(false);
      setScreen('review');
    }
  };

  // ---------------------------------------
  // SHOW NUTRITION RESULT
  // ---------------------------------------
 const openHistory = () => {
  const savedMeals = JSON.parse(
    localStorage.getItem("nutrisnap_meals") || "[]"
  );

  setHistory([...savedMeals].reverse());
  setScreen("history");
};
 
  const openDashboard = () => {
  setDashboardLoading(true);
  setScreen('dashboard');

  try {
    const savedMeals = JSON.parse(
      localStorage.getItem('nutrisnap_meals') || '[]'
    );

    const today = new Date().toDateString();

    const todayMeals = savedMeals.filter(
      meal => new Date(meal.createdAt).toDateString() === today
    );

    const totals = todayMeals.reduce(
      (acc, meal) => {
        const n = meal.nutrition || {};

        acc.calories += Number(n.calories || 0);
        acc.protein += Number(n.protein || 0);
        acc.carbs += Number(
          n.carbs ?? n.carbohydrates ?? 0
        );
        acc.fat += Number(n.fat || 0);
        acc.fiber += Number(n.fiber || 0);

        return acc;
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      }
    );

    setDashboardData({
      totals,
      goal: {
        calories: 2000,
        protein: 90,
        water: 8,
      },
      mealCount: todayMeals.length,
    });
  } catch (err) {
    console.error('Local dashboard error:', err);

    setDashboardData({
      error: 'Could not load saved meals.'
    });
  } finally {
    setDashboardLoading(false);
  }
};
  // ---------------------------------------
  // RESET
  // ---------------------------------------
 const calculate = async () => {
  if (!nutrition) {
    alert("Nutrition information is not available.");
    return;
  }

  if (!selectedFile) {
    alert("Please upload a food image again.");
    return;
  }

  setLoading(true);

  try {
    const body = new FormData();

    body.append("image", selectedFile);
    body.append("source", context.source);
    body.append("portion", context.portion);
    body.append("method", context.method);
    body.append("oil", context.oil);

    const res = await fetch(`${API}/meals/analyze`, {
      method: "POST",
      body,
    });

    const data = await res.json();

    console.log("Nutrition calculation response:", data);

    if (!res.ok) {
      throw new Error(
        data.error || "Nutrition calculation failed"
      );
    }

    setNutrition(data.nutrition || nutrition);

    setHealthySuggestion(
      data.healthy_suggestion || ""
    );

    setScreen("result");

  } catch (err) {
    console.error("Nutrition calculation error:", err);

    alert(
      err.message ||
        "Could not calculate nutrition."
    );

  } finally {
    setLoading(false);
  }
};

  

  const saveMeal = () => {
  if (!nutrition) {
    alert("Nutrition information is not available.");
    return;
  }

  const savedMeals = JSON.parse(
    localStorage.getItem("nutrisnap_meals") || "[]"
  );

  const newMeal = {
    id: Date.now(),
    foods: foods,
    nutrition: nutrition,
    context: context,
    createdAt: new Date().toISOString()
  };

  // ADD the new meal to the existing meals
  const updatedMeals = [...savedMeals, newMeal];

  localStorage.setItem(
    "nutrisnap_meals",
    JSON.stringify(updatedMeals)
  );

  console.log("Saved meals:", updatedMeals);

  setSaved(true);
};

  const reset = () => {
    setScreen('home');
    setPreview(null);
    setSelectedFile(null);
    setFoods([]);
    setNutrition(null);
    setHealthySuggestion('');
    setSaved(false);
    setShowFoodPicker(false);

    setContext({
      source: 'homemade',
      method: 'grilled',
      oil: 'olive',
      portion: 'medium',
    });
  };

  // ---------------------------------------
  // UI
  // ---------------------------------------

  return (
    <main>

      {/* ================================
          NAVBAR
      ================================= */}

      <nav>
        <div className="brand">
          <span className="brand-icon">N</span>
          NutriSnap
        </div>

        <div className="navlinks">
          <a onClick={openDashboard}>Dashboard</a>
          <a onClick={openHistory}>Meal history</a>
          <button className="avatar">MS</button>
        </div>
      </nav>

      {/* ================================
          HOME SCREEN
      ================================= */}
{screen === 'history' && (
  <section className="flow result">
    <button
      className="back"
      onClick={() => setScreen('dashboard')}
    >
      ← Back to dashboard
    </button>

    <p className="eyebrow">MEAL HISTORY</p>

    <h2>Your meals</h2>

    {history.length === 0 ? (
      <div className="insight">
        <Sparkles size={18} />
        <div>
          <b>No meals saved yet</b>
          <p>Scan and save a meal to see it here.</p>
        </div>
      </div>
    ) : (
      <div className="history-list">
        {history.map((meal) => (
          <div className="history-card" key={meal.id}>
            <div>
              <b>
                {meal.foods?.map((food) => food.name).join(", ") ||
                  "Meal"}
              </b>

              <p>
                {new Date(meal.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <strong>
                {fmt(meal.nutrition?.calories)} kcal
              </strong>

              <p>
                Protein: {fmt(meal.nutrition?.protein)}g
              </p>

              <p>
                Carbs: {fmt(meal.nutrition?.carbohydrates)}g
              </p>

              <p>
                Fat: {fmt(meal.nutrition?.fat)}g
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
)}

{screen === 'dashboard' && (
  <section className="flow result">
    <p className="eyebrow">YOUR DASHBOARD</p>

    <h2>Today’s nutrition</h2>

    {dashboardLoading ? (
      <p className="muted">Loading your dashboard...</p>
    ) : dashboardData?.error ? (
      <div className="insight">
        <Sparkles size={18} />
        <div>
          <b>Dashboard unavailable</b>
          <p>{dashboardData.error}</p>
        </div>
      </div>
    ) : dashboardData ? (
      <>
        <p className="muted">
          You have logged {dashboardData.mealCount || 0} meal
          {(dashboardData.mealCount || 0) !== 1 ? 's' : ''} today.
        </p>

        <div className="macro-grid">
          <Metric
            icon={<Flame />}
            label="Calories"
            value={`${fmt(dashboardData.totals?.calories)} kcal`}
          />

          <Metric
            icon={<Drumstick />}
            label="Protein"
            value={`${fmt(dashboardData.totals?.protein)}g`}
          />

          <Metric
            icon={<Wheat />}
            label="Carbs"
            value={`${fmt(dashboardData.totals?.carbs)}g`}
          />

          <Metric
            icon={<Droplets />}
            label="Fat"
            value={`${fmt(dashboardData.totals?.fat)}g`}
          />
        </div>

        <div className="insight">
          <Sparkles size={18} />
          <div>
            <b>Daily goal</b>
            <p>
              {fmt(dashboardData.totals?.calories)} /{' '}
              {dashboardData.goal?.calories || 2000} kcal
            </p>
          </div>
        </div>

        <button
          className="primary wide"
          onClick={() => setScreen('home')}
        >
          Scan another meal
        </button>
      </>
    ) : null}
  </section>
)}

      {screen === 'home' && (
        <section className="hero">

          <div className="hero-copy">

            <p className="eyebrow">
              <Sparkles size={15} />
              AI-powered nutrition, made personal
            </p>

            <h1>
              Know what’s on
              <br />
              your <em>plate.</em>
            </h1>

            <p className="lead">
              Snap a meal and get an intelligent
              nutritional estimate, tailored to how
              it was made.
            </p>

            <div className="actions">

              <button
                className="primary"
                onClick={() =>
                  fileInput.current.click()
                }
              >
                <Upload size={18} />
                Upload a meal
              </button>

              <button
                className="secondary"
                onClick={analyze}
              >
                <Camera size={18} />
                Try demo scan
              </button>

            </div>

            <p className="hint">
              Supports JPG, PNG and JPEG up to 10 MB
            </p>

          </div>

          <div className="hero-art">

            <div className="plate">
              <span>🥗</span>
            </div>

            <div className="float-card calories">
              <Flame />
              <b>486</b>
              <small>calories</small>
            </div>

            <div className="float-card protein">
              <Drumstick />
              <b>32g</b>
              <small>protein</small>
            </div>

            <div className="float-card score">
              <CheckCircle2 />
              <b>Great choice</b>
              <small>Balanced meal</small>
            </div>

          </div>

        </section>
      )}

      {/* ================================
          FOOD DETECTION / REVIEW
      ================================= */}

      {screen === 'review' && (
        <section className="flow">

          <button
            className="back"
            onClick={reset}
          >
            ← Start over
          </button>

          <div className="step">
            <span>1</span>
            Detected

            <i />

            <span>2</span>
            Preparation

            <i />

            <span>3</span>
            Nutrition
          </div>

          <div className="two-col">

            {/* IMAGE */}

            <div>

              {preview ? (
                <img
                  className="meal-img"
                  src={preview}
                  alt="Uploaded meal"
                />
              ) : (
                <div className="demo-image">
                  🍛
                </div>
              )}

            </div>

            {/* DETECTION */}

            <div>

              <p className="eyebrow">
                {loading
                  ? 'ANALYZING IMAGE'
                  : 'FOOD DETECTED'}
              </p>

              <h2>
                {loading
                  ? 'Looking closely…'
                  : 'Does this look right?'}
              </h2>

              <p className="muted">
                Edit or remove items before
                continuing.
              </p>

              <div className="chips">

                {/* DETECTED FOODS */}

                {foods.map((f, i) => (
                  <button
                    key={`${f.name}-${i}`}
                    className="chip"
                  >

                    {f.name}

                    <small>
                      {(
                        f.confidence * 100
                      ).toFixed(1)}
                      %
                    </small>

                    <X
                      size={14}
                      onClick={(event) => {
                        event.stopPropagation();

                        setFoods(
                          foods.filter(
                            (_, x) => x !== i
                          )
                        );
                      }}
                    />

                  </button>
                ))}

                {/* LOW CONFIDENCE WARNING */}

                {showFoodPicker && (
                  <div className="low-confidence">

                    <p>
                      ⚠️ We couldn't confidently
                      identify this food.
                    </p>

                    <button
                      className="secondary"
                      onClick={() =>
                        setShowFoodPicker(false)
                      }
                    >
                      Choose food manually
                    </button>

                  </div>
                )}

              </div>

              {/* CONTINUE */}

              <button
                className="primary wide"
                disabled={loading}
                onClick={() =>
                  setScreen('context')
                }
              >
                Continue
                <ArrowRight size={18} />
              </button>

            </div>

          </div>

        </section>
      )}

      {/* ================================
          PREPARATION / CONTEXT
      ================================= */}

      {screen === 'context' && (
        <section className="flow narrow">

          <button
            className="back"
            onClick={() =>
              setScreen('review')
            }
          >
            ← Back to detected foods
          </button>

          <div className="step">

            <span className="done">
              ✓
            </span>
            Detected

            <i />

            <span>2</span>
            Preparation

            <i />

            <span>3</span>
            Nutrition

          </div>

          <p className="eyebrow">
            A FEW DETAILS
          </p>

          <h2>
            Tell us a little about your food
          </h2>

          <p className="muted">
            These details help make your estimate
            more accurate.
          </p>

          {/* PORTION SIZE */}

          <Choice
            title="Portion size"
            value={context.portion}
            values={[
              ['small', 'Small'],
              ['medium', 'Medium'],
              ['large', 'Large'],
            ]}
            set={(v) =>
              setContext({
                ...context,
                portion: v,
              })
            }
          />

          {/* COOKING QUESTIONS */}

          {needsCookingDetails && (
            <>

              <Choice
                title="Where did it come from?"
                value={context.source}
                values={[
                  [
                    'homemade',
                    'Home made',
                  ],
                  [
                    'restaurant',
                    'Restaurant',
                  ],
                  [
                    'street',
                    'Street food',
                  ],
                ]}
                set={(v) =>
                  setContext({
                    ...context,
                    source: v,
                  })
                }
              />

              <Choice
                title="Cooking method"
                value={context.method}
                values={[
                  ['fried', 'Fried'],
                  ['boiled', 'Boiled'],
                  ['grilled', 'Grilled'],
                  ['steamed', 'Steamed'],
                  ['roasted', 'Roasted'],
                ]}
                set={(v) =>
                  setContext({
                    ...context,
                    method: v,
                  })
                }
              />

              <Choice
                title="Cooking oil"
                value={context.oil}
                values={[
                  [
                    'mustard',
                    'Mustard oil',
                  ],
                  [
                    'olive',
                    'Olive oil',
                  ],
                  [
                    'sunflower',
                    'Sunflower oil',
                  ],
                  ['ghee', 'Ghee'],
                  ['butter', 'Butter'],
                ]}
                set={(v) =>
                  setContext({
                    ...context,
                    oil: v,
                  })
                }
              />

            </>
          )}

          {/* NUTRITION BUTTON */}

          <button
            className="primary wide"
            onClick={calculate}
          >
            See nutrition estimate
            <ArrowRight size={18} />
          </button>

        </section>
      )}

      {/* ================================
          RESULT
      ================================= */}

      {screen === 'result' && nutrition && (
        <section className="flow result">

          <div className="result-head">

            <div>

              <p className="eyebrow">
                YOUR MEAL ESTIMATE
              </p>

              <h2>
                That’s a smart meal.
              </h2>

              <p className="muted">
                Adjusted for your preparation
                details.
              </p>

            </div>

            <div className="calorie-ring">

              <b>
                {fmt(nutrition.calories)}
              </b>

              <small>
                kcal
              </small>

            </div>

          </div>

          {/* MACROS */}

          <div className="macro-grid">

            <Metric
              icon={<Drumstick />}
              label="Protein"
              value={`${fmt(
                nutrition.protein
              )}g`}
            />

            <Metric
              icon={<Wheat />}
              label="Carbs"
              value={`${fmt(
                nutrition.carbohydrates ??
                  nutrition.carbs
              )}g`}
            />

            <Metric
              icon={<Droplets />}
              label="Fat"
              value={`${fmt(
                nutrition.fat
              )}g`}
            />

            <Metric
              icon={<Flame />}
              label="Fiber"
              value={`${fmt(
                nutrition.fiber
              )}g`}
            />

          </div>

          {/* INSIGHT */}

          <div className="insight">

            <Sparkles size={18} />

            <div>

              <b>
                NutriSnap insight
              </b>

              <p>
                {healthySuggestion ||
                  (
                    context.source ===
                    'restaurant'
                      ? 'Your estimate includes a 20% restaurant preparation adjustment.'
                      : 'Home-cooked meals give you more control over ingredients and portions.'
                  )}
              </p>

            </div>

          </div>

          {/* SUGGESTIONS */}

          <div className="suggestions">

            <h3>
              Try these next time
            </h3>

            <span>
              Quinoa bowl
            </span>

            <span>
              Grilled chicken
            </span>

            <span>
              Vegetable pulao
            </span>

          </div>

          {/* SAVE */}

          <button
  className="primary wide"
  onClick={saveMeal}
  disabled={saved || loading}
>

            {saved ? (
              <>
                <CheckCircle2 />
                Saved to today
              </>
            ) : (
              'Save meal to dashboard'
            )}

          </button>

          <button
            className="text-button"
            onClick={reset}
          >
            Scan another meal
          </button>

        </section>
      )}

      {/* ================================
          HIDDEN FILE INPUT
      ================================= */}

      <input
        ref={fileInput}
        onChange={onFile}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        hidden
      />

    </main>
  );
}


/* ========================================
   CHOICE COMPONENT
======================================== */

function Choice({
  title,
  value,
  values,
  set,
}) {
  return (
    <div className="choice">

      <h3>
        {title}
      </h3>

      <div>

        {values.map(
          ([id, label]) => (
            <button
              key={id}
              onClick={() => set(id)}
              className={
                value === id
                  ? 'selected'
                  : ''
              }
            >
              {label}
            </button>
          )
        )}

      </div>

    </div>
  );
}


/* ========================================
   METRIC COMPONENT
======================================== */

function Metric({
  icon,
  label,
  value,
}) {
  return (
    <div className="metric">

      {icon}

      <span>
        {label}
      </span>

      <b>
        {value}
      </b>

    </div>
  );
}


/* ========================================
   REACT ROOT
======================================== */

createRoot(
  document.getElementById('root')
).render(
  <App />
);