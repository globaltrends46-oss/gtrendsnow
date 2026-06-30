import toolsConfig from '@/config/toolsConfig.json';

export const loadToolsConfig = () => {
  return toolsConfig;
};

export const getToolsByCategory = (category) => {
  return toolsConfig.tools.filter(tool => tool.category === category);
};

export const getToolById = (toolId) => {
  return toolsConfig.tools.find(tool => tool.id === toolId);
};

export const getAllCategories = () => {
  const categories = new Set(toolsConfig.tools.map(tool => tool.category));
  return Array.from(categories);
};

// Helper for finding rate using binary search
const solveForRate = (fv, p, n) => {
  let low = 0.0001; // 0.01%
  let high = 1.0; // 100%
  let bestR = 0;

  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const r = mid / 12;
    const currentFv = p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    
    if (currentFv < fv) {
      low = mid;
    } else {
      high = mid;
    }
    bestR = mid;
  }
  return bestR * 100; // Return as percentage
};

export const calculateToolResult = (tool, inputValues) => {
  if (tool.id === 'millionaire_solver') {
    let target = parseFloat(inputValues.targetAmount);
    let investment = parseFloat(inputValues.monthlyInvestment);
    let years = parseFloat(inputValues.years);
    let rate = parseFloat(inputValues.expectedReturn);

    // Identify what to solve for
    if (!target || isNaN(target)) {
      const r = (rate / 100) / 12;
      const n = years * 12;
      target = investment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    } else if (!investment || isNaN(investment)) {
      const r = (rate / 100) / 12;
      const n = years * 12;
      investment = target / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    } else if (!years || isNaN(years)) {
      const r = (rate / 100) / 12;
      const val = (target * r) / (investment * (1 + r)) + 1;
      const n = Math.log(val) / Math.log(1 + r);
      years = n / 12;
    } else if (!rate || isNaN(rate)) {
      rate = solveForRate(target, investment, years * 12);
    } else {
      // If all are provided, recalculate target to show truth
      const r = (rate / 100) / 12;
      const n = years * 12;
      target = investment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    }

    return {
      targetAmount: target.toFixed(0),
      monthlyInvestment: investment.toFixed(0),
      years: years.toFixed(1),
      expectedReturn: rate.toFixed(2),
      recommendation: `To reach $${new Intl.NumberFormat('en-US').format(target.toFixed(0))} in ${years.toFixed(1)} years, maintain a monthly investment of $${new Intl.NumberFormat('en-US').format(investment.toFixed(0))} at ${rate.toFixed(2)}% expected return.`
    };
  }

  if (tool.id === 'card_optimizer') {
    const grocery = parseFloat(inputValues.grocerySpend) || 0;
    const travel = parseFloat(inputValues.travelSpend) || 0;
    const dining = parseFloat(inputValues.diningSpend) || 0;
    
    // Annualized
    const annGrocery = grocery * 12;
    const annTravel = travel * 12;
    const annDining = dining * 12;
    const totalAnn = annGrocery + annTravel + annDining;

    const cards = [
      { name: 'Grocery Card', rewards: (annGrocery * 0.05) + ((annTravel + annDining) * 0.01) },
      { name: 'Travel Card', rewards: (annTravel * 0.10) + ((annGrocery + annDining) * 0.02) },
      { name: 'Dining Card', rewards: (annDining * 0.08) + ((annGrocery + annTravel) * 0.015) },
      { name: 'All-Rounder Card', rewards: totalAnn * 0.02 }
    ];

    const bestCard = cards.reduce((prev, current) => (prev.rewards > current.rewards) ? prev : current);

    return {
      annualSpend: totalAnn.toFixed(0),
      maxRewards: bestCard.rewards.toFixed(0),
      recommendedCard: bestCard.name,
      rewardRate: ((bestCard.rewards / totalAnn) * 100).toFixed(2),
      recommendation: `Recommended card: ${bestCard.name}. You could earn $${new Intl.NumberFormat('en-US').format(bestCard.rewards.toFixed(0))} annually.`
    };
  }

  if (tool.id === 'viral_hook_gen') {
    const topic = inputValues.videoTopic || 'Finance';
    const platform = inputValues.platform || 'tiktok';

    let hooks = [];
    let tip = '';

    if (platform === 'tiktok') {
      hooks = [
        `Nobody is telling you the truth about ${topic}, but I will.`,
        `Stop scrolling! This ${topic} hack is literally illegal to gatekeep.`,
        `How I mastered ${topic} in 24 hours (and you can too).`
      ];
      tip = 'Keep it under 3 seconds to grab attention. Use trending audio.';
    } else if (platform === 'yt_shorts') {
      hooks = [
        `The ONLY ${topic} trick you need in 2026.`,
        `I tried the ultimate ${topic} strategy, here are the results.`,
        `3 mistakes you're making with ${topic}.`
      ];
      tip = 'Deliver value instantly. Focus on visual changes in the first frame.';
    } else if (platform === 'linkedin') {
      hooks = [
        `Unpopular opinion on ${topic} that completely changed my career:`,
        `Most professionals fail at ${topic}. Here's the 3-step framework that worked for me.`,
        `After 5 years in the industry, here is what I learned about ${topic}.`
      ];
      tip = 'Use formatting (line breaks) and lead into a compelling personal story.';
    }

    return {
      platform: platform.replace('_', ' ').toUpperCase(),
      hook1: hooks[0],
      hook2: hooks[1],
      hook3: hooks[2],
      proTip: tip
    };
  }

  if (tool.id === 'dropship_margin') {
    const cost = parseFloat(inputValues.productCost) || 0;
    const price = parseFloat(inputValues.sellingPrice) || 0;
    const dailyAd = parseFloat(inputValues.dailyAdSpend) || 0;

    const grossProfit = price - cost;
    const grossMargin = price > 0 ? (grossProfit / price) * 100 : 0;
    const monthlyAdSpend = dailyAd * 30;
    
    const breakEvenUnits = grossProfit > 0 ? Math.ceil(monthlyAdSpend / grossProfit) : 0;
    const recPriceFor40 = cost / (1 - 0.40);

    return {
      grossProfit: grossProfit.toFixed(2),
      grossMargin: grossMargin.toFixed(2),
      monthlyAdSpend: monthlyAdSpend.toFixed(0),
      breakEvenUnits: breakEvenUnits.toString(),
      recommendedPrice: recPriceFor40.toFixed(2),
      recommendation: `You need to sell ${breakEvenUnits} units per month just to cover your $${new Intl.NumberFormat('en-US').format(monthlyAdSpend.toFixed(0))} ad spend.`
    };
  }

  return {};
};