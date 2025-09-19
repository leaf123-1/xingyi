"use client";

import { useState } from "react";
import { Slider } from "@/components/site/slider";
import { Checkbox } from "@/components/site/checkbox";
import { Button } from "@/components/ui/button";

const categories = ["帐篷", "背负系统", "服装", "炊具"];
const features = ["轻量化", "四季适用", "可拓展", "耐磨"];

export function FiltersPanel() {
  const [price, setPrice] = useState<[number, number]>([1000, 4000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  return (
    <form className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            价格区间
          </h2>
          <Slider value={price} onValueChange={setPrice} max={6000} step={100} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>¥{price[0]}</span>
            <span>¥{price[1]}</span>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            分类
          </h2>
          <div className="space-y-2">
            {categories.map((category) => (
              <Checkbox
                key={category}
                label={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  setSelectedCategories((prev) =>
                    checked
                      ? [...prev, category]
                      : prev.filter((item) => item !== category)
                  );
                }}
              />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            关键特性
          </h2>
          <div className="space-y-2">
            {features.map((feature) => (
              <Checkbox
                key={feature}
                label={feature}
                checked={selectedFeatures.includes(feature)}
                onCheckedChange={(checked) => {
                  setSelectedFeatures((prev) =>
                    checked
                      ? [...prev, feature]
                      : prev.filter((item) => item !== feature)
                  );
                }}
              />
            ))}
          </div>
        </div>
      </div>
      <Button type="submit" className="w-full">
        应用筛选
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => {
          setSelectedCategories([]);
          setSelectedFeatures([]);
          setPrice([1000, 4000]);
        }}
      >
        重置
      </Button>
    </form>
  );
}
