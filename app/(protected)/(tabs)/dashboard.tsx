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
  const [loading, setLoading] = useState(true);

  const chartHeight = selectedType === "saldo" ? 155 : 300;

  // Timeout de 10 segundos para a requisição
  const API_TIMEOUT = 10000;

  useEffect(() => {
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
    fetchData();
  }, [token]);

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

  if (loading || !filteredData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  function formatNumber(num: number): string {
    if (Math.abs(num) >= 1_000_000) {
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (Math.abs(num) >= 1_000) {
      return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  }

  const chartData = filteredData[selectedType].map((value, index) => ({
    value,
    label: filteredData.labels[index],
    frontColor:
      selectedType === "entradas"
        ? "#262626"
        : selectedType === "saidas"
        ? "#bf0808"
        : value >= 0
        ? "#262626"
        : "#bf0808",
    topLabelComponent: () => (
      <Text style={{ 
        color: "#000", 
        fontSize: 15, 
        // fontWeight: "bold" 
      }}>
        {formatNumber(value)}
      </Text>
    ),
    onPress: () => {
      if (selectedType === "saldo") {
        alert("Selecione 'Entradas' ou 'Saídas' para ver o detalhamento das movimentações do dia");
      } else {
        const selectedDate = dataLabels[index];
        router.push({
          pathname: "/categorias",
          params: {
            data: selectedDate,
            tipo: selectedType,
          },
        });
      }
    },
  }));
  

  return (
    <LinearGradient
      colors={["white", "white"]}
      style={{ flex: 1, paddingHorizontal: 20, paddingTop: 60 }}
    >
      {/* Botão de logout no topo */}
      <View style={{ alignItems: "flex-end", marginBottom: 10 }}>
        <Pressable onPress={handleLogout} style={{ padding: 6 }}>
          <Ionicons name="log-out-outline" size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "400",
            textAlign: "center",
            color: "#000",
          }}
        >
          Total do período:
        </Text>

        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            marginBottom: 20,
            textAlign: "center",
            color: "#000",
          }}
        >
          R${" "}
          {filteredData[selectedType]
            .reduce((acc, cur) => acc + cur, 0)
            .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>

        {/* Seletor de dias */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20 }}>
          {[7, 15, 30].map((range) => (
            <TouchableOpacity
              key={range}
              onPress={() => setSelectedRange(range)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                marginHorizontal: 5,
                borderRadius: 20,
                backgroundColor: selectedRange === range ? "#b3270e" : "#fff",
              }}
            >
              <Text style={{ color: selectedRange === range ? "#fff" : "#000" }}>
                {range} dias
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gráfico */}
        <View style={{ height: 350 }}>
          {/* <BarChart
            data={chartData}
            barWidth={65}
            spacing={10}
            width={chartWidth}
            height={chartHeight}
            xAxisLabelTextStyle={{ color: "#000", fontSize: 10 }}
            noOfSections={4}
            isAnimated
            maxValue={Math.max(...filteredData[selectedType].map(Math.abs)) + 1000000}
            barBorderRadius={4}
            // showValuesAsTopLabel={true}
            scrollAnimation
            autoShiftLabels={true}
            yAxisThickness={0}
            hideYAxisText
            yAxisTextStyle={{ fontSize: 10, color: "#fff", fontWeight: "600" }}
            // valueTextStyle={{ color: "#fff", fontSize: 12, fontWeight: "500" }}
          /> */}
        </View>

        {/* Seletor de tipo */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 40,
            marginBottom: 20,
          }}
        >
          {["saldo", "entradas", "saidas"].map((tipo) => (
            <TouchableOpacity
              key={tipo}
              onPress={() => setSelectedType(tipo as "saldo" | "entradas" | "saidas")}
              style={{
                width: "30%",
                height: 70,
                backgroundColor: selectedType === tipo ? "#b3270e" : "#fff",
                borderRadius: 12,
                marginHorizontal: 6,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: selectedType === tipo ? "#fff" : "#000",
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
