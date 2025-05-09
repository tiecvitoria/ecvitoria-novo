import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from 'expo-linear-gradient';


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Campos obrigatórios", "Por favor, preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      router.replace("/teste");
      // router.replace("/(protected)/(tabs)/dashboard");
      // router.replace("/dashboard");
    } else {
      Alert.alert("Erro", "E-mail ou senha incorretos.");
    }
  }

return (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <LinearGradient
      colors={["#b30000", "#000000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.9 }}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      {/* Logo */}
      <Image
        source={require("@/assets/images/vitoria4.png")}
        style={{ 
          width: 180, 
          height: 180, 
          marginBottom: 16, 
          shadowColor: "#F1F1F2",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 10,
          // elevation: 3,
        }}
        resizeMode="contain"
      />

      <Text style={{
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 32,
        textAlign: "center",
        color: "white"
      }}>
        Financeiro - ECV
      </Text>

      {/* Campo E-mail */}
      <View style={{ width: "100%", marginBottom: 16 }}>
        <Text style={{ fontSize: 14, marginBottom: 6, color: "white" }}>E-mail</Text>
        <TextInput
          placeholder="Digite seu e-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#ddd",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 10,
            fontSize: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      </View>

      {/* Campo Senha */}
      <View style={{ width: "100%", marginBottom: 24 }}>
        <Text style={{ fontSize: 14, marginBottom: 6, color: "white" }}>Senha</Text>
        <TextInput
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#ddd",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 10,
            fontSize: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      </View>

      {/* Botão */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#999" : "#575757",
          paddingVertical: 14,
          borderRadius: 10,
          width: "100%",
          alignItems: "center",
          shadowColor: "black",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 1,
          elevation: 3,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
          {loading ? "Entrando..." : "Entrar"}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  </TouchableWithoutFeedback>
);
}
