// protected/grafico.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-svg-charts';
import { Circle } from 'react-native-svg';

const Grafico = () => {
  // Dados fictícios para o gráfico
  const data = [50, 10, 40, 95, 85, 35, 25];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gráfico de Barras</Text>
      <BarChart
        style={{ height: 200 }}
        data={data}
        svg={{ fill: 'rgb(134, 65, 244)' }}
        contentInset={{ top: 30, bottom: 30 }}
        gridMin={0}
      >
        <Grid />
      </BarChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});

export default Grafico;
