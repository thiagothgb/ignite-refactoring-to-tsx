import { useEffect, useState } from "react";

import Header from "../../components/Header";
import api from "../../services/api";
import Food from "../../components/Food";
import ModalAddFood from "../../components/ModalAddFood";
import ModalEditFood from "../../components/ModalEditFood";
import { FoodsContainer } from "./styles";

interface IFood {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string;
}

type IFoodData = Omit<IFood, "id" | "available">;

export function Dashboard() {
  const [foods, setFood] = useState<IFood[]>([]);
  const [editingFood, setEditingFood] = useState<IFood>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFood() {
      const response = await api.get<IFood[]>("/foods");
      setFood(response.data);
    }

    loadFood();
  }, []);

  async function handleAddFood(food: IFoodData) {
    try {
      const response = await api.post<IFood>("/foods", {
        ...food,
        available: true,
      });

      setFood((current) => [...current, response.data]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food: IFood) {
    try {
      const foodUpdated = await api.put(`/foods/${editingFood?.id}`, {
        ...editingFood,
        ...food,
      });

      const foodsUpdated = foods.map((f) =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data
      );

      setFood(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number) {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter((food) => food.id !== id);

    setFood(foodsFiltered);
  }

  function toggleModal() {
    setModalOpen((current) => !current);
  }

  function toggleEditModal() {
    setEditModalOpen((current) => !current);
  }

  function handleEditFood(food: IFood) {
    setEditModalOpen(true);
    setEditingFood(food);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map((food) => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}

export default Dashboard;
