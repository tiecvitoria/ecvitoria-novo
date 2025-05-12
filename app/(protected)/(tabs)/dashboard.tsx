import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import dayjs from "dayjs";
import { BarChart } from "react-native-gifted-charts";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const router = useRouter();
  const { logout, token } = useAuth();

  const [chartWidth, setChartWidth] = useState(screenWidth);
  const [rawData, setRawData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [dataLabels, setDataLabels] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<"saldo" | "entradas" | "saidas">("saldo");
  const [selectedRange, setSelectedRange] = useState(7);
  const [loading, setLoading] = useState(false);

  const chartHeight = selectedType === "saldo" ? 155 : 300;

  const API_TIMEOUT = 10000;

  // Função para buscar os dados da API
  async function fetchData() {
    try {
      setLoading(true);
      const response = await fetch("https://srv773986.hstgr.cloud/api/buscar", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Erro ao buscar dados");
      const data = await response.json();
      setRawData(data.content);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (rawData) {
      const dias = selectedRange;
      const entradasOrdenadas = Object.entries(rawData.entradas)
        .sort(([a], [b]) => dayjs(a).unix() - dayjs(b).unix())
        .slice(0, dias);
      const saidasOrdenadas = Object.entries(rawData.saidas)
        .sort(([a], [b]) => dayjs(a).unix() - dayjs(b).unix())
        .slice(0, dias);

      const labels = entradasOrdenadas.map(([data]) => dayjs(data).format("DD/MM"));
      const fullDates = entradasOrdenadas.map(([data]) => data);
      const entradas = entradasOrdenadas.map(([, valor]) => valor);
      const saidas = saidasOrdenadas.map(([, valor]) => valor);
      const saldo = entradas.map((valor, index) => valor - saidas[index]);

      setFilteredData({ labels, entradas, saidas, saldo });
      setDataLabels(fullDates);
    }
  }, [rawData, selectedRange]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // Função para carregar os dados ao pressionar o botão
  function handleLoadData() {
    fetchData();
  }

  return (
    <LinearGradient colors={["white", "white"]} style={{ flex: 1, paddingHorizontal: 20, paddingTop: 60 }}>
      {/* Botão de logout */}
      <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
        <Pressable onPress={handleLogout} style={{ padding: 6 }}>
          <Ionicons name="log-out-outline" size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 18, fontWeight: "400", textAlign: "center", color: "#000" }}>Total do período:</Text>

        {/* Botão para carregar os dados */}
        <TouchableOpacity
          onPress={handleLoadData}
          style={{ backgroundColor: "#b3270e", padding: 10, borderRadius: 8, marginBottom: 20 }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>Carregar Dados</Text>
        </TouchableOpacity>

        {loading && (
          <ActivityIndicator size="large" color="#b3270e" style={{ marginBottom: 20 }} />
        )}

        {filteredData && filteredData[selectedType]?.length > 0 ? (
          <View style={{ height: 350, overflow: "hidden" }}>
            <BarChart
              data={filteredData[selectedType].map((value, index) => ({
                value,
                label: filteredData.labels[index],
                frontColor: selectedType === "entradas" ? "#262626" : selectedType === "saidas" ? "#bf0808" : value >= 0 ? "#262626" : "#bf0808",
              }))}
              barWidth={65}
              spacing={10}
              width={300}
              height={150}
              noOfSections={4}
              yAxisThickness={0}
              hideYAxisText
            />
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#000" }}>Sem dados para exibir no gráfico</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}
