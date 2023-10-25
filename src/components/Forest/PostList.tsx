import React, { useState, useEffect, useCallback, useContext } from "react";
import { TextPretendard as Text } from "../../common/CustomText";
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ImageBackground,
  Alert
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LoginContext } from "../../common/Context";
import CustomHeader from "../../common/CustomHeader";
import { ForestStackParams } from "../../pages/Forest";
import { Request } from "../../common/requests";
import CardView from "../../common/CardView";
import PostItem from "./components/PostItem";
import PlusButton from "../../common/PlusButton";
import { StackNavigationProp } from "@react-navigation/stack";
import { TabProps } from "../../../App";
const { width, height } = Dimensions.get('window');
const request = new Request();

const PostListScreen = ({
  navigation,
  route
}: NativeStackScreenProps<ForestStackParams, "PostList">) => {
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<string>('');
  const [count, setCount] = useState(0);
  const [posts, setPosts] = useState([] as any);
  const {isLogin, setLogin} = useContext(LoginContext);
  const navigationToTab = useNavigation<StackNavigationProp<TabProps>>();
  const request = new Request();

  const board_category = route.params?.board_category;
  const [userCategories, setUserCategories] = useState([] as any);
  const [checkedList, setCheckedList] = useState(board_category);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const tempid = route.params?.category_Ids;
  const [selectedIds,setSelectedIds]=useState<number[]>(tempid);


  const getUserCategories = async () => {
    const response = await request.get('/forest/user_categories/get/');
    setUserCategories([...response.data.data.results, {id: 0, name: '+'}]);
  }

  const getPosts = async () => {
    let params = new URLSearchParams();
    for (const category of checkedList){
      params.append('semi_category_filters', category.id);
    }
    const response = await request.get(`/forest/?${params.toString()}`, {}, null);
    setPosts(response.data.data.results);
    setCount(response.data.data.count);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setRefreshing(false);
  }

  const onEndReached = () => {
    if (page < Math.ceil(count / 10)) {
      setPage(page+1);
    }
  }

  useEffect(()=>{
    onRefresh()
  },[checkedList]);
  
  useFocusEffect(useCallback(()=>{
    if(isLogin){
      getUserCategories();
    }
  },[isLogin, modalVisible]))

  useFocusEffect(useCallback(() => {
    getPosts();
  }, [refreshing, page, checkedList]));


  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        onSearch={() => {
          navigation.navigate("PostSearch");
        }}
      />
      <View style={{padding: 15, backgroundColor: '#F1FCF5'}}>
            <CardView gap={0} offset={0} pageWidth={width} dot={false} data={userCategories} renderItem={({item}: any) => {
              return (
                <TouchableOpacity style={{borderRadius: 16, borderColor: '#67D393', borderWidth: 1, paddingVertical: 4, paddingHorizontal: 16, margin: 4, backgroundColor: selectedIds.includes(item.id) ? '#67D393' : 'white'}}
                onPress={() => {
                  if (selectedIds.includes(item.id)) {
                    setSelectedIds(selectedIds.filter(id => id !== item.id));
                    setCheckedList(checkedList.filter((category: any) => category.id !== item.id));
                  } else {
                    setSelectedIds([...selectedIds, item.id]);
                    setCheckedList([...checkedList, item]);
                  }
                }}
              >
                <Text style={{color: selectedIds.includes(item.id) ? 'white' : '#202020', fontSize: 14, fontWeight: selectedIds.includes(item.id) ? '600' : '400'}}># {item.name}</Text>
              </TouchableOpacity>
              )}}
            />
          </View>
      {checkedList.length > 0 &&
            <View style={{flexDirection: 'row', paddingHorizontal: 15, paddingBottom: 5}}>
              {checkedList.map((category: any) => 
                (
                  <Text style={{color: '#67D393', fontWeight: '700', fontSize: 16}}>
                    #{category.name+' '}
                  </Text>
                )
              )}
              <Text style={{color: '#67D393', fontWeight: '700', fontSize: 16}}>
                과 관련된 정보들
              </Text>
            </View>
      }
      <View style={{flexDirection: 'row', paddingHorizontal: 15}}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                flex: 1
              }}
            >
              사슴의 추천글
            </Text>
            {/* <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {
              navigation.navigate("PostList", {
                board_name: "사슴의 추천글",
                board_category:checkedList
              });
            }}> 정렬로 수정하면 navigation도 바껴야함  */}
              {/* 더보기버튼 -> 정렬로 수정필요 */}
              {/* <Text style={{ fontSize: 12, fontWeight: '500', marginRight: 5 }}>더보기</Text>
              <Arrow width={12} height={12} color={'black'} /> */}
            {/* </TouchableOpacity> */}
          </View>
      
      <FlatList
        data={posts}
        style={{ flexGrow: 1 }}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEndReachedThreshold={0.3}
        onEndReached={onEndReached}
        renderItem={({ item }) => {
          const {
            id,
            title,
            preview,
            writer,
            photos,
            rep_pic,
            comment_cnt,
            like_cnt,
            user_likes
          } = item;
          return (
            <PostItem
                  key={id}
                  post_id={id}
                  title={title}
                  preview={preview}
                  writer={writer}
                  photos={photos}
                  rep_pic={rep_pic}
                  comment_cnt={comment_cnt}
                  like_cnt={like_cnt}
                  user_likes={user_likes}
                  onRefresh={onRefresh}
                  isLogin={isLogin}
                  navigation={navigation}
                />
          );
        }}
      />
      <PlusButton
        onPress={() => {
          if(!isLogin) {
            Alert.alert(
              "로그인이 필요합니다.",
              "로그인 항목으로 이동하시겠습니까?",
              [
                {
                  text: "이동",
                  onPress: () => navigationToTab.navigate('마이페이지', {})
      
                },
                {
                  text: "취소",
                  onPress: () => { },
                  style: "cancel"
                },
              ],
              { cancelable: false }
            );
          }
          else {
            navigation.navigate('PostUpload', {});
          }
        }}
        position="rightbottom" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: "white",
  },
});

export default PostListScreen;
