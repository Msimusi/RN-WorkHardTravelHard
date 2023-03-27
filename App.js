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
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./colors";
import { Fontisto } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const STORAGE_KEY_TODO = "@todos";
const STORAGE_KEY_WORKING = "@working";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingText, setEditingText] = useState("");

  const complete = false;
  const editing = false;

  useEffect(() => {
    loadToDos();
    loadWorking();
  }, []);

  const saveWorking = async (status) => {
    await AsyncStorage.setItem(STORAGE_KEY_WORKING, String(status));
  };

  const loadWorking = async () => {
    const status = await AsyncStorage.getItem(STORAGE_KEY_WORKING);
    setWorking(Boolean(status));
  };

  const work = () => {
    setWorking(true);
    saveWorking(true);
  };

  const travel = () => {
    setWorking(false);
    saveWorking(false);
  };

  const onChangeText = (payload) => setText(payload);

  // TODO 관리 - 로컬에 저장
  const saveToDos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY_TODO, JSON.stringify(toSave));
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
  const addToDo = () => {
    if (text === "") {
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, complete, editing },
    };

    setToDos(newToDos);
    saveToDos(newToDos);
    setText("");
  };

  // TODO 관리 - 삭제
  const deleteToDo = (key) => {
    if (Platform.OS === "web") {
      if (confirm("Do you Want to delete this To Do?")) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
      return;
    } else {
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
    }
  };

  // TODO 관리 - 완료처리
  const completeTodo = (key) => {
    const newToDos = { ...toDos };

    newToDos[key].complete === true
      ? (newToDos[key].complete = false)
      : (newToDos[key].complete = true);

    setToDos(newToDos);
    saveToDos(newToDos);
  };

  // TODO관리 - 수정모드 ON
  const editToDo = (selectedKey) => {
    const newToDos = { ...toDos };

    setEditingText("");
    Object.keys(newToDos).map((key) => {
      key === selectedKey
        ? (newToDos[key].editing = true)
        : (newToDos[key].editing = false);
    });
    setToDos(newToDos);
    saveToDos(newToDos);
  };

  const onEditText = (payload) => setEditingText(payload);
  const editComplete = (key, done) => {
    const newToDos = { ...toDos };

    newToDos[key].editing = false;
    if (done) {
      newToDos[key].text = editingText;
    }

    setToDos(newToDos);
    saveToDos(newToDos);
    setEditingText("");
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? theme.grey : "white",
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        value={text}
        returnKeyType="done"
        onChangeText={onChangeText}
        onSubmitEditing={addToDo}
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
              <TouchableOpacity
                style={
                  toDos[key].complete === true
                    ? {
                        ...styles.toDo,
                        backgroundColor: "#212121",
                      }
                    : styles.toDo
                }
                key={key}
                onLongPress={() => editToDo(key)}
                onPress={() => completeTodo(key)}
              >
                {toDos[key].editing === true ? (
                  <View style={styles.editingToDo}>
                    <TextInput
                      value={editingText}
                      returnKeyType="done"
                      onChangeText={onEditText}
                      onSubmitEditing={() => editComplete(key, true)}
                      style={styles.editInput}
                    ></TextInput>
                    <TouchableOpacity
                      style={{ position: "absolute", right: 25 }}
                      onPress={() => editComplete(key, false)}
                    >
                      <MaterialCommunityIcons
                        name="cancel"
                        size={24}
                        color="grey"
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text
                    style={
                      toDos[key].complete === true
                        ? {
                            ...styles.toDoText,
                            color: theme.grey,
                            textDecorationLine: "line-through",
                          }
                        : styles.toDoText
                    }
                  >
                    {toDos[key].text}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.delete}
                  onPress={() => deleteToDo(key)}
                >
                  <Fontisto name="trash" size={18} color="grey" />
                </TouchableOpacity>
              </TouchableOpacity>
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
    color: "inherit",
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
  toDoText: { width: "93%", color: "white", fontSize: 16, fontWeight: "500" },
  loading: { color: "white", fontSize: 16, fontWeight: 500 },
  editInput: {
    backgroundColor: "white",
    width: "96%",
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 35,
    borderRadius: 12,
    fontSize: 12,
    marginVertical: -10,
    marginLeft: -5,
  },
  delete: { alignItems: "center", width: "5%" },
  editingToDo: { flex: 1, flexDirection: "row", position: "relative" },
});
