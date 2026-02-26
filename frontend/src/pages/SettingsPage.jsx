import { useThemeStore } from "../store/useThemeStore";
import { Button } from "../components/ui/button";

const themeDescriptions = {
  light: "Clean and bright light theme",
  dark: "Dark theme for comfortable viewing",
  cupcake: "Soft pink and cream colors",
  forest: "Deep green forest colors",
  dracula: "Popular dark purple theme",
  nord: "Arctic, north-bluish colors",
  sunset: "Warm sunset orange colors",
};

const SettingsPage = () => {
  const { theme, themes, setTheme } = useThemeStore();

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-3xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Customize your experience</p>
        </div>

        <div className="border border-border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Theme</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your preferred color scheme
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {themes.map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`
                  relative p-4 rounded-lg border-2 transition-all text-left
                  ${
                    theme === t
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }
                `}
              >
                {/* Theme preview */}
                <div className="space-y-2 mb-3">
                  <div className="flex gap-2">
                    {t === "light" && (
                      <>
                        <div className="w-3 h-3 rounded bg-blue-500"></div>
                        <div className="w-3 h-3 rounded bg-blue-300"></div>
                        <div className="w-3 h-3 rounded bg-gray-200"></div>
                      </>
                    )}
                    {t === "dark" && (
                      <>
                        <div className="w-3 h-3 rounded bg-blue-400"></div>
                        <div className="w-3 h-3 rounded bg-gray-600"></div>
                        <div className="w-3 h-3 rounded bg-gray-400"></div>
                      </>
                    )}
                    {t === "cupcake" && (
                      <>
                        <div className="w-3 h-3 rounded bg-pink-400"></div>
                        <div className="w-3 h-3 rounded bg-blue-300"></div>
                        <div className="w-3 h-3 rounded bg-yellow-300"></div>
                      </>
                    )}
                    {t === "forest" && (
                      <>
                        <div className="w-3 h-3 rounded bg-green-600"></div>
                        <div className="w-3 h-3 rounded bg-cyan-400"></div>
                        <div className="w-3 h-3 rounded bg-green-900"></div>
                      </>
                    )}
                    {t === "dracula" && (
                      <>
                        <div className="w-3 h-3 rounded bg-purple-400"></div>
                        <div className="w-3 h-3 rounded bg-cyan-300"></div>
                        <div className="w-3 h-3 rounded bg-purple-900"></div>
                      </>
                    )}
                    {t === "nord" && (
                      <>
                        <div className="w-3 h-3 rounded bg-cyan-400"></div>
                        <div className="w-3 h-3 rounded bg-blue-400"></div>
                        <div className="w-3 h-3 rounded bg-blue-900"></div>
                      </>
                    )}
                    {t === "sunset" && (
                      <>
                        <div className="w-3 h-3 rounded bg-orange-500"></div>
                        <div className="w-3 h-3 rounded bg-pink-500"></div>
                        <div className="w-3 h-3 rounded bg-orange-900"></div>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-sm">
                  <p className="font-medium capitalize">{t}</p>
                  <p className="text-xs text-muted-foreground">
                    {themeDescriptions[t]}
                  </p>
                </div>

                {theme === t && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;