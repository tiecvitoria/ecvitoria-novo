import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";

const formatarData = (data: string) => {
  const [ano, mes, dia] = data.split("-");
  return `${dia}-${mes}-${ano}`;
};

export default function Detalhamento() {
  const router = useRouter();
  const { data, tipo, categoria, subcategoria } = useLocalSearchParams<{
    data: string;
    tipo: "entradas" | "saidas";
    categoria: string;
    subcategoria: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [detalhes, setDetalhes] = useState<{ descricao: string; valor: number }[]>([]);

  const dataSelecionada = data;

  useEffect(() => {
    async function fetchDetalhes() {
      try {
        setLoading(true);
        const response = await fetch(`https://srv773986.hstgr.cloud/api/detalhamento`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: dataSelecionada,
            tipo,
            categoria,
            subcategoria,
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar dados");
        }

        const data = await response.json();
        setDetalhes(data.content.movimentacoes);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    // Agora o if está no lugar certo
    if (data && tipo && categoria && subcategoria) {
      fetchDetalhes();
    }
  }, [data, tipo, categoria, subcategoria]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#b3270e" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/subcategorias",
            params: {
              data,
              tipo,
              categoria,
            },
          })
        }
      >
        <Text style={{ color: "#b3270e", marginBottom: 20, marginTop: 60, marginLeft: 15, fontSize: 20 }}>
          ← Voltar
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
        Detalhamento
      </Text>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" }}>
        {tipo === "entradas" ? "Entradas" : "Saídas"} em {formatarData(data)}
      </Text>

      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 30, textAlign: "center" }}>
        {categoria} - {subcategoria}
      </Text>

      {detalhes.map((item, index) => (
        <View
          key={index}
          style={{
            padding: 15,
            borderRadius: 8,
            backgroundColor: "#f5f5f5",
            marginBottom: 15,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, width: '70%' }}>{item.descricao}</Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: tipo === "entradas" ? "#5e5151" : "#bf0808" }}>
            R$ {item.valor.toLocaleString('pt-BR')}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
