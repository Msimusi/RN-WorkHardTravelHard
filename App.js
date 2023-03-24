import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { Fontisto } from "@expo/vector-icons";

const STORAGE_KEY_TODO = "@todos";
const STORAGE_KEY_WORKING = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadToDos();
    // loadWorking();
  }, []);

  // useEffect(() => {
  //   console.log(toDos);
  // }, [toDos]);

  // const saveWorking = async (status) => {
  //   await AsyncStorage.setItem(STORAGE_KEY_WORKING, String(status));
  // };

  // const loadWorking = async () => {
  //   const status = await AsyncStorage.getItem(STORAGE_KEY_WORKING);
  //   setWorking(Boolean(status));
  // };

  const travel = () => {
    setWorking(false);
    // saveWorking(false);
  };
  const work = () => {
    setWorking(true);
    // saveWorking(true);
  };
  const onChangeText = (payload) => setText(payload);

  // TODO 관리 - 로컬에 저장
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY_TODO, JSON.stringify(toSave));
    console.log(JSON.stringify(toSave));
  };

  // TODO 관리 - 로컬에서 불러오기
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY_TODO);
      s !== null ? setToDos(JSON.parse(s)) : null;
      setLoading(false);
    } catch (e) {
      console.log("errorMessage : ", e);
    }
  };

  // TODO 관리 - 추가
  const addTodo = () => {
    if (text === "") {
      return;
    }
    const newToDos = { ...toDos, [Date.now()]: { text, working } };

    setToDos(newToDos);
    saveToDos(newToDos);
    setText("");
  };

  // TODO 관리 - 삭제
  const deleteTodo = (key) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancle" },
      {
        text: "I'm Sure",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
    return;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{ ...styles.btnText, color: working ? theme.grey : "white" }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        value={text}
        returnKeyType="done"
        onChangeText={onChangeText}
        onSubmitEditing={addTodo}
        placeholder={working ? "Add a To-Do" : "Where do you wanna Go?"}
        style={styles.input}
      />

      {loading === true ? (
        <View style={{ ...styles.day, alignItems: "center" }}>
          <ActivityIndicator
            color="white"
            style={{ marginTop: 30 }}
            size="large"
          />
          <Text style={styles.loading}>Loading...</Text>
        </View>
      ) : (
        <ScrollView>
          {Object.keys(toDos).map((key) =>
            toDos[key].working == working ? (
              <View style={styles.toDo} key={key}>
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
                <TouchableOpacity onPress={() => deleteTodo(key)}>
                  <Fontisto name="trash" size={18} color="grey" />
                </TouchableOpacity>
              </View>
            ) : null
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingVertical: 50,
    paddingHorizontal: 10,
  },
  header: {
    paddingHorizontal: 30,
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 44,
    fontWeight: 600,
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  toDoText: { color: "white", fontSize: 16, fontWeight: "500" },
  loading: { color: "white", fontSize: 16, fontWeight: 500 },
});
