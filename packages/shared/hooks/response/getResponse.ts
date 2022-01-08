import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { GET_RESPONSE, GET_RESPONSES } from '../../graphql/query/response';
import { RESPONSE_SUB } from '../../graphql/subscription/response';

export const defaultQueryVariables = { page: 1, limit: 10, search: '' };

export function useGetResponses(formId: string, parentId: string = null) {
  const [subsribed, setSubsribed] = useState(false);
  const [state, setState] = useState({
    page: defaultQueryVariables.page,
    limit: defaultQueryVariables.limit,
    search: '',
    showSearch: false,
  });

  const { data, error, loading, subscribeToMore } = useQuery(GET_RESPONSES, {
    variables: { ...state, formId, parentId },
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (!subsribed) {
      setSubsribed(true);
      subscribeToMore({
        document: RESPONSE_SUB,
        variables: {
          formId,
        },
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev;
          const newItem = subscriptionData.data.responseSub;
          let isNew = true;
          let newData = prev?.getResponses?.data?.map((t) => {
            if (t._id === newItem._id) {
              isNew = false;
              return newItem;
            }
            return t;
          });
          if (isNew) {
            newData = [...prev?.getResponses?.data, newItem];
          }
          return {
            ...prev,
            getResponses: {
              ...prev.getResponses,
              data: newData,
            },
          };
        },
      });
    }
  }, []);

  return { data, error, loading, state, setState };
}

export function useGetResponse(_id: string): any {
  const { data, error, loading } = useQuery(GET_RESPONSE, {
    variables: { _id },
    fetchPolicy: 'cache-and-network',
  });
  return { data, error, loading };
}