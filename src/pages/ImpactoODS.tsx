import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";

const BEZIER: [number, number, number, number] = [0.16, 1, 0.3, 1];

const wasteData = [
  { month: "Jan", kg: 80 },
  { month: "Fev", kg: 120 },
  { month: "Mar", kg: 95 },
  { month: "Abr", kg: 150 },
  { month: "Mai", kg: 200 },
  { month: "Jun", kg: 180 },
  { month: "Jul", kg: 220 },
  { month: "Ago", kg: 205 },
];

const studentsData = [
  { month: "Jan", students: 20 },
  { month: "Fev", students: 35 },
  { month: "Mar", students: 50 },
  { month: "Abr", students: 65 },
  { month: "Mai", students: 90 },
  { month: "Jun", students: 120 },
  { month: "Jul", students: 150 },
  { month: "Ago", students: 180 },
];

const componentsPie = [
  { name: "CPU", value: 180 },
  { name: "RAM", value: 150 },
  { name: "GPU", value: 120 },
  { name: "Storage", value: 130 },
  { name: "Monitores", value: 100 },
  { name: "Periféricos", value: 100 },
];

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(213, 94%, 68%)",
  "hsl(217, 91%, 45%)",
  "hsl(213, 94%, 55%)",
  "hsl(217, 70%, 50%)",
  "hsl(213, 80%, 40%)",
];

const odsItems = [
  {
    number: "ODS 4",
    title: "Educação de Qualidade",
    description:
      "Ao fornecer hardware funcional para estudantes, viabilizamos o acesso à educação digital e técnica, essencial no mercado de trabalho atual.",
  },
  {
    number: "ODS 10",
    title: "Redução das Desigualdades",
    description:
      "A inclusão digital reduz a desigualdade de acesso à tecnologia entre estudantes de baixa renda da periferia e centros urbanos privilegiados.",
  },
  {
    number: "ODS 12",
    title: "Consumo e Produção Responsáveis",
    description:
      "A recirculação de componentes eletrônicos promove a economia circular, estendendo a vida útil dos produtos e reduzindo o e-waste.",
  },
];

const chartTooltipStyle = {
  contentStyle: {
    background: "hsl(222, 47%, 7%)",
    border: "1px solid hsl(217, 33%, 17%)",
    borderRadius: "0",
    fontFamily: "'Geist Mono', monospace",
    fontSize: "11px",
    color: "hsl(213, 31%, 91%)",
  },
};

export default function ImpactoODS() {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: BEZIER }}
      >
        <div className="text-primary font-data text-xs uppercase tracking-[0.4em] mb-4">
          Sustainability Dashboard
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground font-data tracking-tighter uppercase mb-4">
          Impacto ODS
        </h1>
        <div className="h-1 w-24 bg-primary mb-16" />
      </motion.div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-20">
        {/* E-waste Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: BEZIER }}
          className="bg-surface border border-border p-8"
        >
          <h3 className="text-xs font-data uppercase tracking-widest text-accent mb-2">
            KG de E-Waste Evitado
          </h3>
          <p className="text-3xl font-bold font-data text-primary-foreground tracking-tighter mb-6">
            1,250 <span className="text-sm text-muted-foreground">KG total</span>
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={wasteData}>
              <XAxis dataKey="month" tick={{ fill: "hsl(215, 16%, 47%)", fontFamily: "'Geist Mono'", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215, 16%, 47%)", fontFamily: "'Geist Mono'", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="kg" fill="hsl(217, 91%, 60%)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Students Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: BEZIER }}
          className="bg-surface border border-border p-8"
        >
          <h3 className="text-xs font-data uppercase tracking-widest text-accent mb-2">
            Estudantes Beneficiados
          </h3>
          <p className="text-3xl font-bold font-data text-primary-foreground tracking-tighter mb-6">
            450+ <span className="text-sm text-muted-foreground">acumulado</span>
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={studentsData}>
              <CartesianGrid stroke="hsl(217, 33%, 17%)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: "hsl(215, 16%, 47%)", fontFamily: "'Geist Mono'", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215, 16%, 47%)", fontFamily: "'Geist Mono'", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Line type="monotone" dataKey="students" stroke="hsl(213, 94%, 68%)" strokeWidth={2} dot={{ fill: "hsl(213, 94%, 68%)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Components Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: BEZIER }}
          className="bg-surface border border-border p-8"
        >
          <h3 className="text-xs font-data uppercase tracking-widest text-accent mb-2">
            Componentes Recirculados por Tipo
          </h3>
          <p className="text-3xl font-bold font-data text-primary-foreground tracking-tighter mb-6">
            780 <span className="text-sm text-muted-foreground">total</span>
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={componentsPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" stroke="none">
                {componentsPie.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip {...chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-4">
            {componentsPie.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2" style={{ background: COLORS[idx] }} />
                <span className="text-[10px] font-data text-muted-foreground uppercase">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ODS Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: BEZIER }}
      >
        <h2 className="text-2xl font-bold font-data text-primary-foreground tracking-tighter uppercase mb-8">
          Objetivos de Desenvolvimento Sustentável
        </h2>
        <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
          {odsItems.map((ods) => (
            <div key={ods.number} className="p-8 bg-surface group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top" />
              <span className="text-3xl font-bold font-data text-primary/30 tracking-tighter">
                {ods.number}
              </span>
              <h3 className="text-sm font-bold font-data text-accent uppercase tracking-wider mt-2 mb-4">
                {ods.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ods.description}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
