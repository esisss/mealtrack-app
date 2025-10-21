import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const FAQS = [
  {
    question: "What is Mealwise?",
    answer:
      "Mealwise is a personal meal-planning app: store your recipes, build a weekly meal plan, generate a grocery list automatically, and track your food spending.",
  },
  {
    question: "Do I have to enter all my recipes from scratch?",
    answer:
      "Not at all. You can start with a quick recipe entry and edit it later. Add recipes gradually and start planning right away.",
  },
  {
    question: "Does the grocery list merge duplicate ingredients?",
    answer:
      "Yes. If two recipes call for 'Onion 1 pc' and 'Onion 2 pcs,' the list will show 'Onion 3 pcs.'",
  },
  {
    question: "Can I adjust servings for a meal?",
    answer:
      "Absolutely. Each recipe has a base serving size, and you can override servings per slot (e.g., Tuesday lunch = 4 servings).",
  },
  {
    question: "How does spending tracking work?",
    answer:
      "When you check items off your list, you can enter the price. You can also log a receipt with multiple products. The app totals the week and shows simple charts of your spending trends.",
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Yes. The interface is designed to work smoothly on mobile, but it looks great on desktop as well.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. This is a portfolio project with no ads and no data sales. Only you can access your account.",
  },
  {
    question: "Do I need internet access?",
    answer:
      "Currently, yes. Mealwise stores your information online so it’s available on any device where you sign in.",
  },
  {
    question: "How much does it cost?",
    answer:
      "It’s free. Mealwise is a personal learning and portfolio project, not a commercial product.",
  },
  {
    question: "What features are coming next?",
    answer:
      "On the roadmap: grouping groceries by aisle/store, adding nutrition info, importing recipes automatically, and richer spending charts.",
  },
];

export const FAQ = () => {
  return (
    <div>
      <Accordion type="single" collapsible className="w-[90vw] mx-auto">
        {FAQS.map((faq) => (
          <AccordionItem
            value={faq.question}
            key={faq.question.toLowerCase().trim()}
          >
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
