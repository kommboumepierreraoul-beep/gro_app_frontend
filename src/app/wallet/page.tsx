/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Eye,
  EyeOff,
  Wallet,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  FileText,
  Grid,
  BarChart3,
  PiggyBank,
  Receipt,
  Leaf,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ArrowDownCircle,
  Moon,
  Sun,
} from "lucide-react";

type Transaction = {
  id: number;
  amount: number;
  type: "credit" | "debit" | "deposit" | "withdraw";
  description: string;
  created_at: string;
  order_id?: number;
  order_number?: string;
  product_name?: string;
  status?: "pending" | "completed" | "failed";
};

type WalletData = {
  balance: number;
  total_credited: number;
  total_debited: number;
  currency: string;
};

type WalletSecurity = {
  has_pin: boolean;
  pin_set_at?: string | null;
};

type ApiError = {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const apiError = error as ApiError;
  return (
    apiError.response?.data?.message ||
    apiError.response?.data?.error ||
    fallback
  );
};

const normalizeWalletData = (payload: unknown): WalletData | null => {
  const root =
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data
      ? (payload as { data: unknown }).data
      : payload;

  const data =
    root &&
    typeof root === "object" &&
    "wallet" in root &&
    (root as { wallet?: unknown }).wallet
      ? (root as { wallet: unknown }).wallet
      : root;

  if (!data || typeof data !== "object") return null;

  const walletData = data as Partial<WalletData>;
  const balance = Number(walletData.balance);

  if (Number.isNaN(balance)) return null;

  return {
    balance,
    total_credited: Number(walletData.total_credited ?? 0),
    total_debited: Number(walletData.total_debited ?? 0),
    currency: walletData.currency ?? "FCFA",
  };
};

function PinCodeInput({
  value,
  onChange,
  label,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  autoFocus?: boolean;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 4 }, (_, index) => value[index] ?? "");

  const updateDigit = (index: number, digit: string) => {
    const nextDigits = [...digits];
    nextDigits[index] = digit.replace(/\D/g, "").slice(-1);
    const nextValue = nextDigits.join("").slice(0, 4);
    onChange(nextValue);

    if (digit && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </label>
      <div className="flex justify-center gap-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputsRef.current[index] = element;
            }}
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            autoFocus={autoFocus && index === 0}
            onChange={(event) => updateDigit(index, event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !digits[index] && index > 0) {
                inputsRef.current[index - 1]?.focus();
              }
            }}
            onPaste={(event) => {
              event.preventDefault();
              const pasted = event.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, 4);
              onChange(pasted);
              inputsRef.current[Math.min(pasted.length, 3)]?.focus();
            }}
            className="h-14 w-12 rounded-2xl border border-white/10 bg-slate-950 text-center text-2xl font-black text-white shadow-inner outline-none transition focus:border-lime-400 focus:ring-4 focus:ring-lime-400/15"
            aria-label={`PIN ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function WalletContent() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [walletSecurity, setWalletSecurity] = useState<WalletSecurity | null>(
    null,
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [visibleBalance, setVisibleBalance] = useState<number | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [depositModal, setDepositModal] = useState(false);
  const [depositPinModal, setDepositPinModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [pinModal, setPinModal] = useState<"setup" | "balance" | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [withdrawChannel, setWithdrawChannel] = useState("mtn");
  const [paymentMethod, setPaymentMethod] = useState("notchpay");
  const [loadingAction, setLoadingAction] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "credit" | "debit" | "deposit"
  >("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const isLight = theme === "light";
  const isBalanceVisible = visibleBalance !== null;
  const walletUi = {
    shell: isLight
      ? "border border-[#c2c9bb]/35 bg-[#f9faf2] text-[#191c18]"
      : "bg-slate-950 text-white",
    card: isLight
      ? "border border-[#c2c9bb]/40 bg-white/85"
      : "border border-white/10 bg-white/5",
    softCard: isLight
      ? "border border-[#c2c9bb]/30 bg-white/75"
      : "border border-white/10 bg-white/5",
    title: isLight ? "text-[#191c18]" : "text-white",
    muted: isLight ? "text-[#72796e]" : "text-slate-400",
    accent: isLight ? "text-[#154212]" : "text-lime-400",
    accentBg: isLight ? "bg-[#eaf3de]" : "bg-lime-500/20",
    secondaryButton: isLight
      ? "border border-[#c2c9bb]/45 bg-white text-[#154212] hover:bg-[#eaf3de]"
      : "bg-white/10 text-white hover:bg-white/20",
    tabIdle: isLight
      ? "bg-white text-[#42493e] hover:bg-[#eaf3de]"
      : "bg-white/5 text-slate-300 hover:bg-white/10",
    chartGrid: isLight ? "#d9ddd2" : "#334155",
    chartText: isLight ? "#72796e" : "#94a3b8",
    tooltipBg: isLight ? "#ffffff" : "#1e293b",
  };

  const fetchWalletSecurity = async () => {
    try {
      const res = await api.get("/wallet/security");
      setWalletSecurity(res.data);
      if (!res.data?.has_pin) {
        setPinModal("setup");
      }
    } catch {
      toast.error("Impossible de verifier la securite du wallet");
    }
  };

  const revealBalance = (walletData: WalletData) => {
    setWallet(walletData);
    setVisibleBalance(walletData.balance);
  };

  const fetchWalletData = async (pin: string) => {
    try {
      const res = await api.get("/wallet/balance", { params: { pin } });
      // 👇 DEBUG TEMPORAIRE — regarde la console (F12) après avoir tapé le PIN
      console.log(
        "RAW API RESPONSE /wallet/balance:",
        JSON.stringify(res.data, null, 2),
      );

      const walletData = normalizeWalletData(res.data);

      if (!walletData) {
        console.warn("normalizeWalletData a retourné null pour ce payload ⬆️");
        toast.error("Le solde n'a pas pu etre lu. Verifiez le backend.");
        setVisibleBalance(null);
        return false;
      }

      revealBalance(walletData);
      toast.success("Solde affiche");
      return true;
    } catch (error) {
      // 👇 DEBUG TEMPORAIRE — regarde la console (F12) si ça part en erreur
      console.error("WALLET BALANCE ERROR:", error);

      const status = (error as ApiError).response?.status;
      toast.error(
        status === 401 || status === 403 || status === 422
          ? "PIN incorrect ou invalide"
          : getApiErrorMessage(error, "Impossible de charger le solde"),
      );
      setVisibleBalance(null);
      return false;
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/wallet/history");
      setTransactions(res.data.data || res.data || []);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletSecurity();
    fetchTransactions();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("trxref") || urlParams.get("reference")) {
      toast.success("Paiement reçu, vérification en cours…");
      const interval = setInterval(() => {
        fetchTransactions();
      }, 2000);
      setTimeout(() => clearInterval(interval), 15000);
      window.history.replaceState({}, "", "/wallet");
    }
  }, []);

  const handleSetupPin = async () => {
    if (!/^\d{4}$/.test(pinInput)) {
      toast.error(
        pinInput.length === 0
          ? "Le PIN doit contenir 4 chiffres"
          : `PIN incomplet : ${pinInput.length}/4 chiffre(s)`,
      );
      return;
    }
    if (!/^\d{4}$/.test(pinConfirm)) {
      toast.error(
        pinConfirm.length === 0
          ? "Confirmez votre PIN"
          : `Confirmation incomplete : ${pinConfirm.length}/4 chiffre(s)`,
      );
      return;
    }
    if (pinInput !== pinConfirm) {
      toast.error("Les deux PIN ne correspondent pas");
      return;
    }

    setLoadingAction(true);
    try {
      await api.post("/wallet/pin", {
        pin: pinInput,
        pin_confirmation: pinConfirm,
      });
      toast.success("PIN configure");
      setWalletSecurity({ has_pin: true });
      const unlocked = await fetchWalletData(pinInput);
      if (unlocked) {
        setPinModal(null);
        setPinInput("");
        setPinConfirm("");
      }
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Impossible de configurer le PIN"));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnlockBalance = async () => {
    if (!/^\d{4}$/.test(pinInput)) {
      toast.error(
        pinInput.length === 0
          ? "Entrez votre PIN de 4 chiffres"
          : `PIN incomplet : ${pinInput.length}/4 chiffre(s)`,
      );
      return;
    }

    setLoadingAction(true);
    try {
      const unlocked = await fetchWalletData(pinInput);
      if (unlocked) {
        setPinModal(null);
        setPinInput("");
      }
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePinInputChange = (value: string) => {
    setPinInput(value);

    if (pinModal === "balance" && /^\d{4}$/.test(value) && !loadingAction) {
      setLoadingAction(true);
      fetchWalletData(value)
        .then((unlocked) => {
          if (unlocked) {
            setPinModal(null);
            setPinInput("");
          }
        })
        .finally(() => setLoadingAction(false));
    }
  };

  const requestBalanceVisibility = () => {
    if (isBalanceVisible) {
      setVisibleBalance(null);
      return;
    }

    if (!walletSecurity?.has_pin) {
      setPinModal("setup");
      return;
    }

    setPinModal("balance");
  };

  const startDepositPinStep = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Montant invalide");
      return;
    }

    if (!walletSecurity?.has_pin) {
      setDepositModal(false);
      setPinModal("setup");
      return;
    }

    setTransactionPin("");
    setDepositModal(false);
    setDepositPinModal(true);
  };

  const handleDeposit = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Montant invalide");
      return;
    }
    if (!/^\d{4}$/.test(transactionPin)) {
      toast.error("Entrez votre PIN wallet");
      return;
    }
    setLoadingAction(true);
    try {
      const payload = {
        amount: amountNum,
        method: "notchpay",
        pin: transactionPin,
      };

      const res = await api.post("/wallet/deposit", payload);

      const authUrl =
        res.data?.data?.authorization_url ||
        res.data?.authorization_url ||
        null;

      if (authUrl) {
        toast.success("Redirection vers la page de paiement…");
        setDepositModal(false);
        setDepositPinModal(false);
        setAmount("");
        setTransactionPin("");
        window.location.href = authUrl;
      } else {
        toast.error("Impossible d'obtenir l'URL de paiement");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur lors du dépôt");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleWithdraw = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Montant invalide");
      return;
    }
    if (!phoneNumber || phoneNumber.length < 9) {
      toast.error("Numéro Mobile Money invalide");
      return;
    }
    if (!/^\d{4}$/.test(transactionPin)) {
      toast.error("Entrez votre PIN wallet");
      return;
    }
    setLoadingAction(true);
    try {
      await api.post("/wallet/withdraw", {
        amount: amountNum,
        phone: phoneNumber,
        channel: withdrawChannel,
        pin: transactionPin,
      });
      toast.success("Retrait effectué");
      setWithdrawModal(false);
      setAmount("");
      setPhoneNumber("");
      setTransactionPin("");
      setWithdrawChannel("mtn");
      fetchTransactions();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erreur lors du retrait");
    } finally {
      setLoadingAction(false);
    }
  };

  const isDeposit = (tx: Transaction) =>
    tx.type === "deposit" ||
    (tx.type === "credit" && tx.description?.toLowerCase().includes("dépôt"));

  const isCredit = (tx: Transaction) => tx.type === "credit" && !isDeposit(tx);

  const filteredTransactions = transactions.filter((t) => {
    if (activeTab === "credit") return isCredit(t);
    if (activeTab === "debit")
      return t.type === "debit" || t.type === "withdraw";
    if (activeTab === "deposit") return isDeposit(t);
    return true;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const chartData = () => {
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split("T")[0];
    });
    const grouped: Record<string, { credit: number; debit: number }> = {};
    transactions.forEach((t) => {
      const day = t.created_at.split("T")[0];
      if (!grouped[day]) grouped[day] = { credit: 0, debit: 0 };
      if (t.type === "credit" || t.type === "deposit")
        grouped[day].credit += t.amount;
      else grouped[day].debit += t.amount;
    });
    return last30Days.map((day) => ({
      date: day,
      credit: grouped[day]?.credit || 0,
      debit: grouped[day]?.debit || 0,
    }));
  };

  const getTxLabel = (tx: Transaction) => {
    if (isDeposit(tx)) return "Dépôt via NotchPay";
    if (tx.type === "withdraw") return "Retrait";
    if (tx.type === "credit" && tx.order_number)
      return `Vente de ${tx.product_name || "Produit"} #${tx.order_number}`;
    return tx.description;
  };

  const getTxSign = (tx: Transaction) => {
    if (tx.type === "credit" || tx.type === "deposit") return "+";
    return "-";
  };

  const getTxColor = (tx: Transaction) => {
    if (tx.type === "credit" || tx.type === "deposit") return "text-lime-400";
    return isLight ? "text-[#191c18]" : "text-white";
  };

  const getStatusLabel = (tx: Transaction) => {
    if (tx.status === "completed")
      return isDeposit(tx) || tx.type === "deposit" ? "Succès" : "Effectué";
    if (tx.status === "pending") return "En attente";
    return "Échec";
  };

  const getStatusClass = (tx: Transaction) => {
    if (tx.status === "completed")
      return tx.type === "credit" || tx.type === "deposit"
        ? "bg-lime-500/20 text-lime-400"
        : "bg-cyan-500/20 text-cyan-400";
    if (tx.status === "pending") return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-slate-400 animate-pulse">Chargement…</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-[calc(100vh-7rem)] rounded-2xl pb-8 transition-colors ${walletUi.shell}`}
    >
      <div className="mx-auto max-w-7xl space-y-6 px-3 py-5 sm:px-5 sm:py-6">
        <div className="flex justify-end">
          <button
            onClick={() => setTheme(isLight ? "dark" : "light")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${walletUi.secondaryButton}`}
          >
            {isLight ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            {isLight ? "Mode sombre" : "Mode clair"}
          </button>
        </div>

        {/* Carte solde principale */}
        <div
          className={`relative overflow-hidden rounded-3xl p-6 shadow-sm backdrop-blur-xl ${walletUi.card}`}
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 400 200"
            >
              <path
                d="M0,150 Q50,140 100,160 T200,120 T300,140 T400,80"
                fill="none"
                stroke="#a3e635"
                strokeWidth="4"
              />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p
                  className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${walletUi.muted}`}
                >
                  SOLDE DISPONIBLE
                  <button
                    onClick={requestBalanceVisibility}
                    className={`transition ${isLight ? "hover:text-[#154212]" : "hover:text-lime-400"}`}
                  >
                    {isBalanceVisible ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                </p>
                <h1 className={`mt-2 text-4xl font-bold ${walletUi.title}`}>
                  {isBalanceVisible
                    ? Number(
                        visibleBalance ?? wallet?.balance ?? 0,
                      ).toLocaleString()
                    : "••••••"}
                  <span className={`text-xl font-medium ${walletUi.accent}`}>
                    {" "}
                    FCFA
                  </span>
                </h1>
              </div>
              <div className={`rounded-full p-2 ${walletUi.accentBg}`}>
                <Wallet className={`h-6 w-6 ${walletUi.accent}`} />
              </div>
            </div>
            <div className="flex flex-wrap justify-between items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${walletUi.accentBg}`}
                >
                  <TrendingUp className={`h-4 w-4 ${walletUi.accent}`} />
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${walletUi.accent} ${walletUi.accentBg}`}
                >
                  +12.5% ce mois
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDepositModal(true)}
                  className="flex items-center gap-2 rounded-xl bg-lime-500 px-5 py-2.5 font-semibold text-slate-950 transition hover:bg-lime-400"
                >
                  <PlusCircle className="w-4 h-4" /> Déposer
                </button>
                <button
                  onClick={() => setWithdrawModal(true)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition ${walletUi.secondaryButton}`}
                >
                  <MinusCircle className="w-4 h-4" /> Retirer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className={`mb-4 text-lg font-semibold ${walletUi.title}`}>
            Actions Rapides
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[
              {
                icon: ArrowDownCircle,
                label: "Retirer",
                onClick: () => setWithdrawModal(true),
              },
              {
                icon: PlusCircle,
                label: "Déposer",
                onClick: () => setDepositModal(true),
              },
              {
                icon: RefreshCw,
                label: "Transférer",
                onClick: () => toast("Bientôt disponible"),
              },
              {
                icon: FileText,
                label: "Relevés",
                onClick: () => toast("Export PDF bientôt"),
              },
              {
                icon: Grid,
                label: "Plus",
                onClick: () => toast("Plus d'options à venir"),
              },
            ].map((action) => (
              <button
                key={action.label}
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 min-w-[70px] group"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full backdrop-blur transition group-hover:bg-lime-500/20 ${walletUi.softCard}`}
                >
                  <action.icon className={`h-6 w-6 ${walletUi.accent}`} />
                </div>
                <span
                  className={`text-xs transition ${isLight ? "group-hover:text-[#154212]" : "group-hover:text-white"} ${walletUi.muted}`}
                >
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Graphique d'évolution */}
        <div className={`rounded-2xl p-5 backdrop-blur-xl ${walletUi.card}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold ${walletUi.title}`}>
              Évolution (30j)
            </h2>
            <button
              onClick={fetchTransactions}
              className={`${walletUi.accent} transition hover:scale-105`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData()}>
                <defs>
                  <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a3e635" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="debitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={walletUi.chartGrid}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: walletUi.chartText }}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  tick={{ fill: walletUi.chartText }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: walletUi.tooltipBg,
                    border: "none",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="credit"
                  stroke="#a3e635"
                  fill="url(#creditGrad)"
                  name="Entrées"
                />
                <Area
                  type="monotone"
                  dataKey="debit"
                  stroke="#06b6d4"
                  fill="url(#debitGrad)"
                  name="Sorties"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div
            className={`mt-3 flex justify-center gap-6 text-sm ${walletUi.muted}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-lime-500 rounded-full"></div> Entrées
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div> Sorties
            </div>
          </div>
        </div>

        {/* Historique des transactions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold ${walletUi.title}`}>
              Activités
            </h2>
            <button className={`text-sm font-semibold ${walletUi.accent}`}>
              Voir tout
            </button>
          </div>
          <div className="flex gap-2 mb-4">
            {[
              { key: "all", label: "Tout" },
              { key: "credit", label: "Ventes" },
              { key: "debit", label: "Retraits" },
              { key: "deposit", label: "Dépôts" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-lime-500 text-slate-950"
                    : walletUi.tabIdle
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {paginatedTransactions.length === 0 ? (
              <div
                className={`rounded-2xl p-8 text-center backdrop-blur ${walletUi.softCard} ${walletUi.muted}`}
              >
                <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune transaction</p>
              </div>
            ) : (
              paginatedTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`flex items-center justify-between rounded-2xl p-4 backdrop-blur transition hover:bg-white/10 ${walletUi.softCard}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        tx.type === "credit" || tx.type === "deposit"
                          ? "bg-lime-500/20"
                          : isLight
                            ? "bg-[#e7e9e1]"
                            : "bg-white/10"
                      }`}
                    >
                      {tx.type === "credit" || tx.type === "deposit" ? (
                        <Leaf className="w-6 h-6 text-lime-400" />
                      ) : (
                        <CreditCard className={`h-6 w-6 ${walletUi.muted}`} />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${walletUi.title}`}>
                        {getTxLabel(tx)}
                      </p>
                      <p className={`text-xs ${walletUi.muted}`}>
                        {new Date(tx.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getTxColor(tx)}`}>
                      {getTxSign(tx)}
                      {tx.amount.toLocaleString()} FCFA
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${getStatusClass(tx)}`}
                    >
                      {getStatusLabel(tx)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 rounded-lg px-4 py-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${walletUi.secondaryButton}`}
              >
                <ChevronLeft className="w-4 h-4" /> Précédent
              </button>
              <span className={`px-4 py-2 ${walletUi.muted}`}>
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 rounded-lg px-4 py-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${walletUi.secondaryButton}`}
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bento stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-2xl p-4 backdrop-blur ${walletUi.softCard}`}>
            <BarChart3 className="text-cyan-400 w-6 h-6" />
            <p className={`mt-2 text-xs ${walletUi.muted}`}>Prêts en cours</p>
            <p className={`text-xl font-bold ${walletUi.title}`}>0 FCFA</p>
          </div>
          <div className={`rounded-2xl p-4 backdrop-blur ${walletUi.softCard}`}>
            <PiggyBank className="text-lime-400 w-6 h-6" />
            <p className={`mt-2 text-xs ${walletUi.muted}`}>Épargne Projet</p>
            <p className={`text-xl font-bold ${walletUi.title}`}>
              850K <span className="text-xs text-lime-400">/ 2M</span>
            </p>
          </div>
        </div>
      </div>

      {/* Modal Dépôt */}
      {pinModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            if (pinModal !== "setup") setPinModal(null);
          }}
        >
          <div
            className="bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {pinModal === "setup" ? "Configurer le PIN" : "PIN wallet"}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {pinModal === "setup"
                    ? "Choisissez un code de 4 chiffres pour securiser votre wallet."
                    : "Entrez votre PIN pour afficher le solde."}
                </p>
              </div>
              {pinModal !== "setup" && (
                <button
                  onClick={() => setPinModal(null)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="space-y-4">
              <PinCodeInput
                label="PIN 4 chiffres"
                value={pinInput}
                onChange={handlePinInputChange}
                autoFocus
              />
              {pinModal === "setup" && (
                <PinCodeInput
                  label="Confirmer le PIN"
                  value={pinConfirm}
                  onChange={setPinConfirm}
                />
              )}
              <button
                onClick={
                  pinModal === "setup" ? handleSetupPin : handleUnlockBalance
                }
                disabled={loadingAction}
                className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-slate-950 font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingAction ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Verification...
                  </>
                ) : pinModal === "setup" ? (
                  "Activer le PIN"
                ) : (
                  "Afficher le solde"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {depositModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDepositModal(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">
                Approvisionner le wallet
              </h2>
              <button
                onClick={() => setDepositModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 p-4">
                <p className="text-sm font-semibold text-lime-300">
                  1. Informations de paiement
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-300">
                  Renseignez le montant et le moyen de paiement. Le PIN wallet
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  sera demandé à l'étape suivante pour confirmer l'opération.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 10000"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-lime-500 outline-none text-white"
                  autoFocus
                />
              </div>
              {false && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="6XXXXXXXX"
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Service
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    >
                      <option value="notchpay">
                        Paiement par carte / Mobile Money (NotchPay)
                      </option>
                    </select>
                  </div>
                </>
              )}
              <button
                onClick={startDepositPinStep}
                disabled={loadingAction}
                className="w-full py-3 bg-lime-500 hover:bg-lime-400 text-slate-950 font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Continuer vers le PIN →
              </button>
            </div>
          </div>
        </div>
      )}

      {depositPinModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDepositPinModal(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-300">
                  2. Confirmation securisee
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Confirmer le depot
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Entrez votre PIN wallet pour autoriser la redirection vers le
                  paiement.
                </p>
              </div>
              <button
                onClick={() => setDepositPinModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <div>
                <p className="text-xs text-slate-400">Montant</p>
                <p className="mt-1 font-bold text-white">
                  {Number(amount || 0).toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Service</p>
                <p className="mt-1 font-bold text-white">NotchPay</p>
              </div>
              {false && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-400">Telephone</p>
                  <p className="mt-1 font-bold text-white">
                    {phoneNumber || "Non renseigne"}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <PinCodeInput
                label="PIN wallet"
                value={transactionPin}
                onChange={setTransactionPin}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setDepositPinModal(false);
                    setDepositModal(true);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Modifier
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={loadingAction}
                  className="rounded-xl bg-lime-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-lime-400 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingAction ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Traitement...
                    </>
                  ) : (
                    "Payer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Retrait */}
      {withdrawModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setWithdrawModal(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">
                Retirer des fonds
              </h2>
              <button
                onClick={() => setWithdrawModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex: 5000"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Maximum : {wallet?.balance?.toLocaleString()} FCFA
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Téléphone Mobile Money
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="6XXXXXXXX"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Opérateur
                </label>
                <select
                  value={withdrawChannel}
                  onChange={(e) => setWithdrawChannel(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="mtn">MTN Mobile Money</option>
                  <option value="orange">Orange Money</option>
                </select>
              </div>
              <div>
                <PinCodeInput
                  label="PIN wallet"
                  value={transactionPin}
                  onChange={setTransactionPin}
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={loadingAction}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loadingAction ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Envoi...
                  </>
                ) : (
                  "Demander le retrait"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
  return <WalletContent />;
}
