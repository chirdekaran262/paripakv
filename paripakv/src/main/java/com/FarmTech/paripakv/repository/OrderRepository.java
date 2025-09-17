package com.FarmTech.paripakv.repository;

import com.FarmTech.paripakv.model.Order;
import com.FarmTech.paripakv.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByBuyerId(UUID buyerId);


    List<Order> findAllByListingId(UUID id);

    List<Order> findByStatusAndTransporterIdIsNull(OrderStatus orderStatus);

    List<Order> findAllByTransporterId(UUID transporterId);
}
