import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const formatarData = (data: string) => {
  const [ano, mes, dia] = data.split("-");
  return `${dia}-${mes}-${ano}`;
};

export default function ClassesGerenciais() {
  const router = useRouter();
  const { data, tipo } = useLocalSearchParams<{ data: string; tipo: "entradas" | "saidas" }>();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);

  const dataSelecionada = data;

  useEffect(() => {
    async function fetchClasses() {
      try {
        setLoading(true);

        const response: any = await fetch(
          `https://srv773986.hstgr.cloud/api/classes`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: dataSelecionada,
              tipo: tipo,
            }),
          }
        );
        console.log(response)
        if (!response.ok) {
          throw new Error("Erro ao buscar dados");
        }

        const data = await response.json();
        setClasses(data.content.classes_gerenciais);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    if (data && tipo) {
      fetchClasses();
    }
  }, [data, tipo]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#b3270e" />
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

  function calculaAlturaExtra(valorMaximo: number): number {
    if (valorMaximo >= 1_000_000) {
      return 100_000;
    } else if (valorMaximo >= 100_000) {
      return 10_000;
    } else if (valorMaximo >= 10_000) {
      return 1_000;
    } else if (valorMaximo >= 1_000) {
      return 500;
    } else {
      return 100;
    }
  }

  const valorMaximo = Math.max(...classes.map(item => item.valor), 0);
  const max = valorMaximo + calculaAlturaExtra(valorMaximo);

  const chartData = classes.map((item) => {
    const formattedValue = formatNumber(item.valor);

    return {
      value: item.valor,
      label: item.classe_gerencial,
      frontColor: tipo === "entradas" ? "#5e5151" : "#bf0808",
      topLabelComponent: () => (
        <Text style={{ color: "#000", fontSize: 15 }}>
          {formattedValue}
        </Text>
      ),
      onPress: () => {
        router.push({
          pathname: "/categorias",
          params: {
            data,
            tipo,
            classe_gerencial: item.classe_gerencial,
          },
        });
      },
    };
  });

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 60 }}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={{ color: "#b3270e", marginBottom: 20, marginTop: 60, marginLeft: 15, fontSize: 20 }}>
          ← Voltar
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
        Classes Gerenciais
      </Text>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: 'center' }}>
        {tipo === "entradas" ? "Entradas" : "Saídas"} em {formatarData(data)}
      </Text>

      <BarChart
        data={chartData}
        barWidth={70}
        spacing={20}
        height={200}
        noOfSections={4}
        isAnimated
        maxValue={max}
        barBorderRadius={4}
        scrollAnimation
        autoShiftLabels
        yAxisThickness={0}
        hideYAxisText
        yAxisTextStyle={{ fontSize: 10, color: "#fff", fontWeight: "600" }}
      />

      <View style={{ marginTop: 30 }}>
        {classes.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() =>
              router.push({
                pathname: "/categorias",
                params: {
                  data,
                  tipo,
                  classe_gerencial: item.classe_gerencial,
                },
              })
            }
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#ddd",
              backgroundColor: '#fff',
              padding: 10,
              borderRadius: 10,
              margin: 3
            }}
          >
            <Text style={{ fontSize: 13, width: "60%" }}>{item.classe_gerencial}</Text>
            <Text style={{ fontSize: 13, fontWeight: "bold" }}>
              R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
