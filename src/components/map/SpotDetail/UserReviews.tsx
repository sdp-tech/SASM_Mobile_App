import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Alert, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import styled from 'styled-components/native';
import { reviewDataProps } from './DetailCard';
import CardView from '../../../common/CardView';
import ReviewDetail from './ReviewDetail';

const ReviewBox = styled.View`
  border-color: #DDDDDD;
  border-bottom-width: 1px;
  padding-vertical: 15px;
`
const TextBox = styled.View`
  padding-left: 15px;
`


interface UserReviewsProps {
  reviewData: reviewDataProps;
  rerender: () => void;
  category: string;
}

export default function UserReviews({ reviewData, rerender, category }: UserReviewsProps): JSX.Element {
  const [detailModal, setDetailModal] = useState<boolean>(false);

  return (
    <ReviewBox>
      <Modal visible={detailModal}>
        <ReviewDetail category={category} setDetailModal={setDetailModal} reviewData={reviewData} rerender={rerender} />
      </Modal>
      {
        reviewData &&
        <>
          {
            reviewData.photos.length != 0 &&
            <CardView
              data={reviewData.photos}
              renderItem={({ item }: any) => <Image source={{ uri: item.imgfile }} style={{ height: 150, width: 200, marginHorizontal: 5 }} />}
              gap={10}
              offset={10}
              pageWidth={200}
              height={150}
              dot={false}
            />
          }
          <TouchableOpacity onPress={() => { setDetailModal(true) }}>
            <TextBox>
              <Text style={TextStyles.common}>
                {reviewData.nickname}
              </Text>
              <Text style={TextStyles.common}>
                {reviewData.contents}
              </Text>
              <Text style={TextStyles.date}>
                {reviewData.created.slice(0, 10).replace(/-/gi, '.')}
              </Text>
            </TextBox>
          </TouchableOpacity>
        </>
      }
    </ReviewBox >
  )
}

const TextStyles = StyleSheet.create({
  date: {
    fontSize: 10,
    color: '#9A9A9A',
  },
  common: {
    fontSize: 14,
    marginVertical: 5
  }
})