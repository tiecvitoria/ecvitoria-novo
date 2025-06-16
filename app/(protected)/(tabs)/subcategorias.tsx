import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const formatarData = (data: string) => {
  const [ano, mes, dia] = data.split("-");
  return `${dia}-${mes}-${ano}`;
};

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

export default function SubCategorias() {
  const router = useRouter();
  const { data, tipo, categoria, classe_gerencial  } = useLocalSearchParams<{ data: string; tipo: "entradas" | "saidas"; categoria: string;classe_gerencial: string; }>();
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);

  const dataSelecionada = data;

  useEffect(() => {
    async function fetchSubcategorias() {
      try {
        setLoading(true);
        const response = await fetch(`https://srv773986.hstgr.cloud/api/subcategorias`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: dataSelecionada,
            tipo: tipo,
            classe_gerencial: classe_gerencial,
            categoria: categoria
          }),
        });
        console.log(dataSelecionada)
        console.log(tipo)
        console.log(classe_gerencial)
        console.log(categoria)
        if (!response.ok) {
          throw new Error("Erro ao buscar dados");
        }

        const json = await response.json();
        console.log('retornoa das subcategorias')
        console.log(json.content)
        setCategorias(json.content.subcategorias);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    if (data && tipo && categoria) {
      fetchSubcategorias();
    }
  }, [data, tipo, categoria]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#b3270e" />
      </View>
    );
  }

  const valorMaximo = Math.max(...categorias.map(item => item.valor), 0);
  const max = valorMaximo + calculaAlturaExtra(valorMaximo);

  const chartData = categorias.map((item) => {
    const formattedValue = formatNumber(item.valor);

    return {
      value: item.valor,
      label: item.subcategoria,
      frontColor: tipo === "entradas" ? "#5e5151" : "#bf0808",
      topLabelComponent: () => (
        <Text style={{ color: "#000", fontSize: 15 }}>
          {formattedValue}
        </Text>
      ),
      onPress: () => {
        router.push({
          pathname: "/detalhamento",
          params: {
            data,
            tipo,
            categoria,
            subcategoria: item.subcategoria,
            classe_gerencial
          },
        });
      },
    };
  });

  return (
    <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 60 }}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/categorias",
            params: {
              data,
              tipo,
              classe_gerencial
            },
          })
        }
      >
        <Text style={{ color: "#b3270e", marginBottom: 20, fontSize: 20, marginLeft: 15 }}>
          ← Voltar
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
        Subcategorias
      </Text>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: 'center' }}>
        {tipo === "entradas" ? "Entradas" : "Saídas"} em {formatarData(data)}
      </Text>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 30, textAlign: 'center' }}>
        {categoria}
      </Text>

      {/* <View style={{display:'flex', justifyContent:'center', margin:'auto'}}> */}
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
      {/* </View> */}

      <View style={{ marginTop: 30 }}>
        {categorias.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() =>
              router.push({
                pathname: "/detalhamento",
                params: {
                  data,
                  tipo,
                  categoria,
                  subcategoria: item.subcategoria,
                  classe_gerencial,
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
              margin: 3,
            }}
          >
            <Text style={{ fontSize: 13, width: "60%" }}>{item.subcategoria}</Text>
            <Text style={{ fontSize: 13, fontWeight: "bold" }}>
            R$ {item.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
