export interface CalculatorCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  desc: string;
}

export const CATEGORIES: CalculatorCategory[] = [
  { id:"finance",      name:"Finance & Money",     icon:"💰", color:"#17483f", bg:"#eaf1f5", desc:"Loans, investments, savings, tax & more" },
  { id:"health",       name:"Health & Fitness",    icon:"❤️", color:"#963d3a", bg:"#fbf0ef", desc:"BMI, calories, BMR, body fat & nutrition" },
  { id:"math",         name:"Math & Science",      icon:"📐", color:"#397f70", bg:"#f2f0f8", desc:"Algebra, geometry, statistics & science" },
  { id:"education",    name:"Education & GPA",     icon:"🎓", color:"#764b14", bg:"#fff7ed", desc:"GPA, grades, marks & academic planning" },
  { id:"converters",   name:"Unit Converters",     icon:"🔄", color:"#12544c", bg:"#eff8f5", desc:"Length, weight, temp, speed, data & more" },
  { id:"everyday",     name:"Everyday Tools",      icon:"🏠", color:"#764b14", bg:"#fbf4e9", desc:"Age, dates, fuel, passwords & daily tools" },
  { id:"construction", name:"Construction",        icon:"🏗️", color:"#764b14", bg:"#fbf4e9", desc:"Concrete, materials, area, cost & engineering" },
  { id:"technology",   name:"Technology",          icon:"💻", color:"#123C37", bg:"#d8e5ec", desc:"Binary, hex, subnet, network & developer tools" },
  { id:"business",     name:"Business",             icon:"📊", color:"#12544c", bg:"#d1fae5", desc:"Profit, break-even, ROI, payroll & productivity" },
];
