const fs = require('fs');
let content = fs.readFileSync('src/components/ResultPage.tsx', 'utf8');

// Add CheckCircle and XCircle back from lucide-react
content = content.replace(/import \{ Leaf, TrendingDown \} from "lucide-react";/, 'import { Leaf, TrendingDown, CheckCircle2, XCircle } from "lucide-react";');

// Update map
content = content.replace(/{\/\* Chart Replacement: Sorted List \*\//, \
              {/* Calculate actual ranks mapping */}
              {(() => {
                const sortedCategories = Object.entries(categoryTotals)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([name]) => name);

                const categoryMap: Record<string, string> = {
                  transport: "Transport",
                  food: "Alimentation",
                  energy: "Énergie",
                  consumption: "Consommation"
                };

                const predictedHighest = predictions?.highestConsumption?.map((id: string) => categoryMap[id]) || [];

                return (
                  <div className="mb-8 max-w-lg mx-auto">
                    <h3 className="text-xl font-semibold text-[var(--viv-navy)] mb-4 text-center">
                      Répartition par domaine
                    </h3>
                    <div className="space-y-3">
                      {chartData
                        .sort((a, b) => b.value - a.value)
                        .map((entry, index) => {
                          const actualRank = sortedCategories.indexOf(entry.name) + 1;
                          const wasPredictedHigh = predictedHighest.includes(entry.name);
                          
                          let predictionIcon = null;
                          if (wasPredictedHigh) {
                              // It was predicted as high. Is it actually high? (top 2/3?) Let's say top 2 is correct if they chose 2.
                              // Simple logic: if they predicted it, and it's in the actual top N (where N=number of predictions).
                              const topNCount = predictedHighest.length > 0 ? predictedHighest.length : 3;
                              const isCorrect = actualRank <= topNCount;
                              
                              predictionIcon = isCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-[var(--viv-secondary)]" title="Prédiction correcte" />
                              ) : (
                                <XCircle className="w-5 h-5 text-[var(--viv-red)]" title="Prédiction incorrecte" />
                              );
                          } else {
                              // If they didn't predict it, but it IS in the top N, it's a missed prediction.
                              const topNCount = predictedHighest.length > 0 ? predictedHighest.length : 3;
                              if (actualRank <= topNCount) {
                                  predictionIcon = <XCircle className="w-5 h-5 text-[var(--viv-red)]" title="Oublié dans les prédictions" />;
                              }
                          }

                          return (
                            <div key={\list-\\} className="flex items-center justify-between p-4 rounded-xl bg-white shadow-sm border border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                <span className="font-medium text-[var(--viv-navy)]">{entry.name}</span>
                                {predictions && predictionIcon && (
                                  <div className="ml-2" title="Par rapport à votre prédiction">
                                    {predictionIcon}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="font-bold" style={{ color: entry.color }}>{((entry.value / totalCO2) * 100).toFixed(0)}%</span>
                                <span className="text-gray-500 w-12 text-right">{entry.value}t</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })()}
\);

content = content.replace(/\{\/\* Chart Replacement: Sorted List \*\/\}[\s\S]*?\{\/\* CTA Buttons \*\/\}/, '{/* CTA Buttons */}');

fs.writeFileSync('src/components/ResultPage.tsx', content);
